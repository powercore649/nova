import { NextRequest, NextResponse } from 'next/server';
import db, { initRepoTables, rowToRepo, genId } from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';

  try {
    await initRepoTables();

    let result;
    if (search) {
      result = await db.execute({
        sql: `SELECT * FROM repos WHERE visibility='public' AND (name LIKE ? OR description LIKE ?) ORDER BY created_at DESC LIMIT 50`,
        args: [`%${search}%`, `%${search}%`],
      });
    } else {
      result = await db.execute(`SELECT * FROM repos WHERE visibility='public' ORDER BY created_at DESC LIMIT 50`);
    }

    return NextResponse.json({ repos: result.rows.map(rowToRepo) });
  } catch (error) {
    console.error('Repos GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch repos', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { name, description, visibility, ownerName, readme } = body;

    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!/^[a-zA-Z0-9_.-]+$/.test(name.trim()))
      return NextResponse.json({ error: 'Name can only contain letters, numbers, hyphens, underscores and dots' }, { status: 400 });
    if (!ownerName?.trim()) return NextResponse.json({ error: 'Owner name is required' }, { status: 400 });

    const owner  = ownerName.trim().slice(0, 32);
    const id     = genId();
    const ownerId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const vis    = visibility === 'private' ? 'private' : 'public';
    const desc   = (description || '').trim().slice(0, 500);
    const rm     = readme?.trim() || `# ${name.trim()}\n\n${desc || 'A nova-browser repository.'}\n`;

    await initRepoTables();

    // Check duplicate
    const existing = await db.execute({ sql: `SELECT id FROM repos WHERE owner_name=? AND name=? LIMIT 1`, args: [owner, name.trim()] });
    if (existing.rows.length) return NextResponse.json({ error: 'Repository name already taken for this owner' }, { status: 409 });

    await db.execute({
      sql: `INSERT INTO repos (id, name, description, owner_name, owner_id, visibility, readme) VALUES (?,?,?,?,?,?,?)`,
      args: [id, name.trim(), desc, owner, ownerId, vis, rm],
    });

    const row = await db.execute({ sql: `SELECT * FROM repos WHERE id=?`, args: [id] });
    return NextResponse.json({ repo: rowToRepo(row.rows[0]) }, { status: 201 });
  } catch (error: any) {
    console.error('Repo create error:', error);
    return NextResponse.json({ error: 'Failed to create repository', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
