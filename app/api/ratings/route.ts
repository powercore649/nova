import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Rating from '@/models/Rating';

export const dynamic = 'force-dynamic';

// GET /api/ratings?targetType=project&targetId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get('targetType') || 'project';
  const targetId = searchParams.get('targetId');

  if (!targetId) {
    return NextResponse.json({ error: 'Missing targetId' }, { status: 400 });
  }

  try {
    await dbConnect();
    const agg = await Rating.aggregate([
      { $match: { targetType, targetId } },
      { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } },
    ]);
    const avg = agg[0]?.avg ?? 0;
    const count = agg[0]?.count ?? 0;
    return NextResponse.json({ avg: Math.round(avg * 10) / 10, count });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}

// POST /api/ratings — public, one rating per session key (IP+targetId or cookie key)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetType, targetId, score, voterKey } = body;

    if (!targetId || !score || score < 1 || score > 5) {
      return NextResponse.json({ error: 'Invalid rating data' }, { status: 400 });
    }

    const type = targetType || 'project';
    // Use voterKey (set by client from localStorage) as accountId to deduplicate
    const accountId = (voterKey || `anon-${req.headers.get('x-forwarded-for') || 'unknown'}`).slice(0, 64);

    await dbConnect();
    await Rating.findOneAndUpdate(
      { targetType: type, targetId, accountId },
      { score },
      { upsert: true }
    );

    // Return updated stats
    const agg = await Rating.aggregate([
      { $match: { targetType: type, targetId } },
      { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } },
    ]);
    const avg = agg[0]?.avg ?? 0;
    const count = agg[0]?.count ?? 0;
    return NextResponse.json({ avg: Math.round(avg * 10) / 10, count });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}
