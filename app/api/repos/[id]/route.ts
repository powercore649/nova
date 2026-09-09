import { NextRequest, NextResponse } from 'next/server';
import db, { initRepoTables, rowToRepo } from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await initRepoTables();
    const result = await db.execute({ sql: `SELECT * FROM repos WHERE id=? LIMIT 1`, args: [id] });
    if (!result.rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ repo: rowToRepo(result.rows[0]) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    await initRepoTables();
    const now = new Date().toISOString();

    if (body.stars !== undefined)      await db.execute({ sql: `UPDATE repos SET stars=?, updated_at=? WHERE id=?`,      args: [body.stars, now, id] });
    if (body.description !== undefined) await db.execute({ sql: `UPDATE repos SET description=?, updated_at=? WHERE id=?`, args: [String(body.description).slice(0,500), now, id] });
    if (body.readme !== undefined)      await db.execute({ sql: `UPDATE repos SET readme=?, updated_at=? WHERE id=?`,      args: [String(body.readme), now, id] });
    if (body.visibility !== undefined)  await db.execute({ sql: `UPDATE repos SET visibility=?, updated_at=? WHERE id=?`,  args: [body.visibility === 'private' ? 'private' : 'public', now, id] });

    const result = await db.execute({ sql: `SELECT * FROM repos WHERE id=? LIMIT 1`, args: [id] });
    if (!result.rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ repo: rowToRepo(result.rows[0]) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await initRepoTables();
    await db.execute({ sql: `DELETE FROM repos WHERE id=?`, args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
