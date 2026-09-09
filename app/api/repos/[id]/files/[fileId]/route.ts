import { NextRequest, NextResponse } from 'next/server';
import { sql, initRepoTables, rowToFile } from '@/lib/pg';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  try {
    await initRepoTables();
    const result = await sql`SELECT * FROM repo_files WHERE id = ${fileId} AND repo_id = ${id} LIMIT 1`;
    if (!result.rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ file: rowToFile(result.rows[0]) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    const uploaderName = (body.uploaderName || 'Anonymous').slice(0, 32);

    await initRepoTables();
    const file = await sql`SELECT path FROM repo_files WHERE id = ${fileId} AND repo_id = ${id} LIMIT 1`;
    if (!file.rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const filePath = String(file.rows[0].path);
    await sql`DELETE FROM repo_files WHERE id = ${fileId}`;

    const sha = crypto.randomBytes(20).toString('hex');
    const message = `Delete ${filePath}`;
    // Pass array as PostgreSQL literal: '{path}'
    const filesChangedLiteral = `{${filePath.replace(/[{}]/g, '')}}`;

    await sql`
      INSERT INTO repo_commits (repo_id, message, uploader_name, files_changed, files_deleted, sha)
      VALUES (${id}, ${message}, ${uploaderName}, ${filesChangedLiteral}, ${1}, ${sha})
    `;
    await sql`UPDATE repos SET updated_at = NOW() WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
