import { NextRequest, NextResponse } from 'next/server';
import db, { initRepoTables, rowToFile, genId } from '@/lib/turso';
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
      result = await db.execute({
        sql: `SELECT id,repo_id,path,name,folder,size,mime_type,is_text,commit_message,uploader_name,created_at,updated_at FROM repo_files WHERE repo_id=? AND folder=? ORDER BY folder ASC, name ASC`,
        args: [id, folder],
      });
    } else {
      result = await db.execute({
        sql: `SELECT id,repo_id,path,name,folder,size,mime_type,is_text,commit_message,uploader_name,created_at,updated_at FROM repo_files WHERE repo_id=? ORDER BY folder ASC, name ASC`,
        args: [id],
      });
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
    const repoCheck = await db.execute({ sql: `SELECT id FROM repos WHERE id=? LIMIT 1`, args: [id] });
    if (!repoCheck.rows.length) return NextResponse.json({ error: 'Repo not found' }, { status: 404 });

    const formData = await req.formData();
    const commitMessage = (formData.get('commitMessage') as string || 'Add files').slice(0, 200);
    const uploaderName  = (formData.get('uploaderName')  as string || 'Anonymous').slice(0, 32);
    const uploaderId    = (formData.get('uploaderId')    as string || `anon-${Date.now()}`).slice(0, 64);
    const basePath      = (formData.get('basePath')      as string || '').trim().replace(/^\/|\/$/g, '');

    const fileEntries = formData.getAll('files') as File[];
    const pathEntries = formData.getAll('paths') as string[];

    if (!fileEntries.length) return NextResponse.json({ error: 'No files provided' }, { status: 400 });

    const TEXT_TYPES = ['text/', 'application/json', 'application/javascript', 'application/typescript', 'application/xml'];
    const changedPaths: string[] = [];
    let added = 0, modified = 0;
    const now = new Date().toISOString();

    for (let i = 0; i < fileEntries.length; i++) {
      const file = fileEntries[i];
      const relativePath = pathEntries[i] || file.name;
      const fullPath = basePath ? `${basePath}/${relativePath}`.replace(/\/+/g, '/') : relativePath;
      const parts = fullPath.split('/');
      const name   = parts[parts.length - 1];
      const folder = parts.slice(0, -1).join('/');

      if (file.size > 10 * 1024 * 1024) continue;

      const bytes  = await file.arrayBuffer();
      const isText = TEXT_TYPES.some(t => file.type.startsWith(t)) || !file.type;
      let content: string;
      if (isText && file.size < 500 * 1024) {
        content = new TextDecoder().decode(bytes);
      } else {
        content = `data:${file.type || 'application/octet-stream'};base64,${Buffer.from(bytes).toString('base64')}`;
      }

      const mimeType = file.type || 'application/octet-stream';

      // Check existing
      const existing = await db.execute({ sql: `SELECT id FROM repo_files WHERE repo_id=? AND path=? LIMIT 1`, args: [id, fullPath] });

      if (existing.rows.length) {
        await db.execute({
          sql: `UPDATE repo_files SET content=?,size=?,mime_type=?,is_text=?,commit_message=?,uploader_name=?,uploader_id=?,updated_at=? WHERE repo_id=? AND path=?`,
          args: [content, file.size, mimeType, isText ? 1 : 0, commitMessage, uploaderName, uploaderId, now, id, fullPath],
        });
        modified++;
      } else {
        await db.execute({
          sql: `INSERT INTO repo_files (id,repo_id,path,name,folder,content,size,mime_type,is_text,commit_message,uploader_name,uploader_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          args: [genId(), id, fullPath, name, folder, content, file.size, mimeType, isText ? 1 : 0, commitMessage, uploaderName, uploaderId, now, now],
        });
        added++;
      }

      // Auto-update README if uploading README.md
      if (name.toLowerCase() === 'readme.md' && isText) {
        await db.execute({ sql: `UPDATE repos SET readme=?,updated_at=? WHERE id=?`, args: [content, now, id] });
      }

      changedPaths.push(fullPath);
    }

    // Commit record
    const sha = crypto.randomBytes(20).toString('hex');
    await db.execute({
      sql: `INSERT INTO repo_commits (id,repo_id,message,uploader_name,uploader_id,files_changed,files_added,files_modified,files_deleted,sha) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      args: [genId(), id, commitMessage, uploaderName, uploaderId, JSON.stringify(changedPaths), added, modified, 0, sha],
    });

    await db.execute({ sql: `UPDATE repos SET updated_at=? WHERE id=?`, args: [now, id] });

    return NextResponse.json({ success: true, uploaded: fileEntries.length, sha });
  } catch (error) {
    console.error('Repo upload error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
