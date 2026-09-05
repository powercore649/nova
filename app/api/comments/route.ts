import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import { getAuthPayload } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

// GET /api/comments?targetType=project&targetId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get('targetType');
  const targetId = searchParams.get('targetId');

  if (!targetType || !targetId) {
    return NextResponse.json({ error: 'Missing targetType or targetId' }, { status: 400 });
  }

  try {
    await dbConnect();
    const comments = await Comment.find({ targetType, targetId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST /api/comments — public (no auth required, username from body)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetType, targetId, text, username } = body;

    if (!targetType || !targetId || !text?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (text.trim().length > 1000) {
      return NextResponse.json({ error: 'Comment too long (max 1000 chars)' }, { status: 400 });
    }

    const displayName = (username?.trim() || 'Anonymous').slice(0, 32);

    // Try to get accountId from JWT, fall back to anonymous
    const auth = await getAuthPayload(req);
    const accountId = auth?.userId || `anon-${Date.now()}`;

    await dbConnect();
    const comment = await Comment.create({
      targetType,
      targetId,
      accountId,
      username: displayName,
      text: text.trim(),
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
