import { NextRequest, NextResponse } from 'next/server';
import { sql, initRepoTables, rowToFile } from '@/lib/pg';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get('folder');

  try {
    await initRepoTables();
    let result;
    if (folder !== null) {
      result = await sql`
        SELECT id, repo_id, path, name, folder, size, mime_type, is_text, commit_message, uploader_name, created_at, updated_at
        FROM repo_files WHERE repo_id = ${id} AND folder = ${folder}
        ORDER BY folder ASC, name ASC
      `;
    } else {
      result = await sql`
        SELECT id, repo_id, path, name, folder, size, mime_type, is_text, commit_message, uploader_name, created_at, updated_at
        FROM repo_files WHERE repo_id = ${id}
        ORDER BY folder ASC, name ASC
      `;
    }
    return NextResponse.json({ files: result.rows.map(rowToFile) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch files', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await initRepoTables();

    // Verify repo exists
    const repoCheck = await sql`SELECT id FROM repos WHERE id = ${id} LIMIT 1`;
    if (!repoCheck.rows.length) return NextResponse.json({ error: 'Repo not found' }, { status: 404 });

    const formData = await req.formData();
    const commitMessage = (formData.get('commitMessage') as string || 'Add files').slice(0, 200);
    const uploaderName = (formData.get('uploaderName') as string || 'Anonymous').slice(0, 32);
    const uploaderId = (formData.get('uploaderId') as string || `anon-${Date.now()}`).slice(0, 64);
    const basePath = (formData.get('basePath') as string || '').trim().replace(/^\/|\/$/g, '');

    const fileEntries = formData.getAll('files') as File[];
    const pathEntries = formData.getAll('paths') as string[];

    if (!fileEntries.length) return NextResponse.json({ error: 'No files provided' }, { status: 400 });

    const TEXT_TYPES = ['text/', 'application/json', 'application/javascript', 'application/typescript', 'application/xml'];
    const changedPaths: string[] = [];
    let added = 0, modified = 0;

    for (let i = 0; i < fileEntries.length; i++) {
      const file = fileEntries[i];
      const relativePath = pathEntries[i] || file.name;
      const fullPath = basePath ? `${basePath}/${relativePath}`.replace(/\/+/g, '/') : relativePath;
      const parts = fullPath.split('/');
      const name = parts[parts.length - 1];
      const folder = parts.slice(0, -1).join('/');

      if (file.size > 10 * 1024 * 1024) continue;

      const bytes = await file.arrayBuffer();
      const isText = TEXT_TYPES.some(t => file.type.startsWith(t)) || !file.type;
      let content: string;
      if (isText && file.size < 500 * 1024) {
        content = new TextDecoder().decode(bytes);
      } else {
        content = `data:${file.type || 'application/octet-stream'};base64,${Buffer.from(bytes).toString('base64')}`;
      }

      const mimeType = file.type || 'application/octet-stream';

      // Upsert
      const existing = await sql`SELECT id FROM repo_files WHERE repo_id = ${id} AND path = ${fullPath} LIMIT 1`;
      if (existing.rows.length) {
        await sql`
          UPDATE repo_files SET content = ${content}, size = ${file.size}, mime_type = ${mimeType},
            is_text = ${isText}, commit_message = ${commitMessage}, uploader_name = ${uploaderName},
            uploader_id = ${uploaderId}, updated_at = NOW()
          WHERE repo_id = ${id} AND path = ${fullPath}
        `;
        modified++;
      } else {
        await sql`
          INSERT INTO repo_files (repo_id, path, name, folder, content, size, mime_type, is_text, commit_message, uploader_name, uploader_id)
          VALUES (${id}, ${fullPath}, ${name}, ${folder}, ${content}, ${file.size}, ${mimeType}, ${isText}, ${commitMessage}, ${uploaderName}, ${uploaderId})
        `;
        added++;
      }

      // Update repo README if uploading README.md
      if (name.toLowerCase() === 'readme.md' && isText) {
        await sql`UPDATE repos SET readme = ${content}, updated_at = NOW() WHERE id = ${id}`;
      }

      changedPaths.push(fullPath);
    }

    // Create commit — pass array as PostgreSQL literal
    const sha = crypto.randomBytes(20).toString('hex');
    const filesLiteral = `{${changedPaths.map(p => p.replace(/[{},"\\]/g, '')).join(',')}}`;
    await sql`
      INSERT INTO repo_commits (repo_id, message, uploader_name, uploader_id, files_changed, files_added, files_modified, files_deleted, sha)
      VALUES (${id}, ${commitMessage}, ${uploaderName}, ${uploaderId}, ${filesLiteral}, ${added}, ${modified}, ${0}, ${sha})
    `;

    // Update repo updated_at
    await sql`UPDATE repos SET updated_at = NOW() WHERE id = ${id}`;

    return NextResponse.json({ success: true, uploaded: fileEntries.length, sha });
  } catch (error) {
    console.error('Repo upload error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
