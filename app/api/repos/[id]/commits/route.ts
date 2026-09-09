import { NextRequest, NextResponse } from 'next/server';
import db, { initRepoTables, rowToCommit } from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await initRepoTables();
    const result = await db.execute({
      sql: `SELECT * FROM repo_commits WHERE repo_id=? ORDER BY created_at DESC LIMIT 50`,
      args: [id],
    });
    return NextResponse.json({ commits: result.rows.map(rowToCommit) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch commits', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
