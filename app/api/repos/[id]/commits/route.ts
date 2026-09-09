import { NextRequest, NextResponse } from 'next/server';
import { sql, initRepoTables, rowToCommit } from '@/lib/pg';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await initRepoTables();
    const result = await sql`
      SELECT * FROM repo_commits
      WHERE repo_id = ${id}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return NextResponse.json({ commits: result.rows.map(rowToCommit) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch commits', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
