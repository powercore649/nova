import { NextRequest, NextResponse } from 'next/server';
import db, { initRepoTables, rowToFile, genId } from '@/lib/turso';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  try {
    await initRepoTables();
    const result = await db.execute({ sql: `SELECT * FROM repo_files WHERE id=? AND repo_id=? LIMIT 1`, args: [fileId, id] });
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
    const file = await db.execute({ sql: `SELECT path FROM repo_files WHERE id=? AND repo_id=? LIMIT 1`, args: [fileId, id] });
    if (!file.rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const filePath = String(file.rows[0].path);
    await db.execute({ sql: `DELETE FROM repo_files WHERE id=?`, args: [fileId] });

    const sha = crypto.randomBytes(20).toString('hex');
    const now = new Date().toISOString();
    await db.execute({
      sql: `INSERT INTO repo_commits (id,repo_id,message,uploader_name,files_changed,files_deleted,sha,created_at) VALUES (?,?,?,?,?,?,?,?)`,
      args: [genId(), id, `Delete ${filePath}`, uploaderName, JSON.stringify([filePath]), 1, sha, now],
    });
    await db.execute({ sql: `UPDATE repos SET updated_at=? WHERE id=?`, args: [now, id] });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
