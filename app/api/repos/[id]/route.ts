import { NextRequest, NextResponse } from 'next/server';
import { sql, initRepoTables, rowToRepo } from '@/lib/pg';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await initRepoTables();
    const result = await sql`SELECT * FROM repos WHERE id = ${id} LIMIT 1`;
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

    if (body.stars !== undefined) {
      await sql`UPDATE repos SET stars = ${body.stars}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (body.description !== undefined) {
      await sql`UPDATE repos SET description = ${String(body.description).slice(0, 500)}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (body.readme !== undefined) {
      await sql`UPDATE repos SET readme = ${String(body.readme)}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (body.visibility !== undefined) {
      await sql`UPDATE repos SET visibility = ${body.visibility === 'private' ? 'private' : 'public'}, updated_at = NOW() WHERE id = ${id}`;
    }

    const result = await sql`SELECT * FROM repos WHERE id = ${id} LIMIT 1`;
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
    // CASCADE deletes files and commits
    await sql`DELETE FROM repos WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
