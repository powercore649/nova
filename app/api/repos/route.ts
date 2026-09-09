import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Repo from '@/models/Repo';

export const dynamic = 'force-dynamic';

// GET /api/repos — list public repos (or all if ownerName filter)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get('owner');
  const search = searchParams.get('q');

  try {
    await dbConnect();
    const filter: any = { visibility: 'public' };
    if (owner) filter.ownerName = owner;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const repos = await Repo.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ repos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch repos' }, { status: 500 });
  }
}

// POST /api/repos — create a new repo (public, no auth required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, visibility, ownerName, readme } = body;

    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!/^[a-zA-Z0-9_.-]+$/.test(name.trim())) {
      return NextResponse.json({ error: 'Name can only contain letters, numbers, hyphens, underscores and dots' }, { status: 400 });
    }

    const owner = (ownerName?.trim() || 'Anonymous').slice(0, 32);
    const ownerId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    await dbConnect();

    const existing = await Repo.findOne({ ownerName: owner, name: name.trim() });
    if (existing) return NextResponse.json({ error: 'A repo with this name already exists for this owner' }, { status: 409 });

    const repo = await Repo.create({
      name: name.trim(),
      description: (description || '').trim().slice(0, 500),
      ownerName: owner,
      ownerId,
      visibility: visibility === 'private' ? 'private' : 'public',
      readme: readme || `# ${name.trim()}\n\n${description || 'A nova-browser repository.'}\n`,
    });

    return NextResponse.json({ repo }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: 'Repo name already taken' }, { status: 409 });
    console.error('Repo create error:', error);
    return NextResponse.json({ error: 'Failed to create repo' }, { status: 500 });
  }
}
