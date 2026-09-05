import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Collection from '@/models/Collection';

export const dynamic = 'force-dynamic';

// GET /api/collections — list all (public)
export async function GET() {
  try {
    await dbConnect();
    const collections = await Collection.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return NextResponse.json({ collections });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

// POST /api/collections — create new (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, username, projectIds } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const displayName = (username?.trim() || 'Anonymous').slice(0, 32);
    const accountId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    await dbConnect();
    const collection = await Collection.create({
      name: name.trim().slice(0, 100),
      description: (description || '').trim().slice(0, 500),
      accountId,
      username: displayName,
      projectIds: Array.isArray(projectIds) ? projectIds : [],
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}
