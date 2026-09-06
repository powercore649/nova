import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Favorite from '@/models/Favorite';

export const dynamic = 'force-dynamic';

// GET /api/favorites?voterKey=xxx&targetType=project
// Returns all bookmarks for this visitor key
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const voterKey = searchParams.get('voterKey');
  const targetType = searchParams.get('targetType') || 'project';

  if (!voterKey) {
    return NextResponse.json({ favorites: [] });
  }

  try {
    await dbConnect();
    const favorites = await Favorite.find({ accountId: voterKey, targetType })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ favorites });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/favorites — toggle bookmark
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetType, targetId, voterKey } = body;

    if (!targetType || !targetId || !voterKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const existing = await Favorite.findOne({ targetType, targetId, accountId: voterKey });

    if (existing) {
      // Already bookmarked → remove it
      await Favorite.findByIdAndDelete(existing._id);
      return NextResponse.json({ bookmarked: false });
    } else {
      // Not bookmarked → add it
      await Favorite.create({ targetType, targetId, accountId: voterKey });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    console.error('Favorites POST error:', error);
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}

// DELETE /api/favorites?targetType=project&targetId=xxx&voterKey=xxx
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get('targetType');
  const targetId = searchParams.get('targetId');
  const voterKey = searchParams.get('voterKey');

  if (!targetType || !targetId || !voterKey) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    await dbConnect();
    await Favorite.findOneAndDelete({ targetType, targetId, accountId: voterKey });
    return NextResponse.json({ bookmarked: false });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
