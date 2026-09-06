import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';

// GET /api/comments?targetType=project&targetId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get('targetType') as 'project' | 'file' | null;
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
    console.error('Comment GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST /api/comments — fully public, no auth required
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetType, targetId, text, username } = body;

    if (!targetType || !targetId) {
      return NextResponse.json({ error: 'Missing targetType or targetId' }, { status: 400 });
    }
    if (!text || !String(text).trim()) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }
    if (String(text).trim().length > 1000) {
      return NextResponse.json({ error: 'Comment too long (max 1000 chars)' }, { status: 400 });
    }
    if (!['project', 'file'].includes(targetType)) {
      return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 });
    }

    const displayName = String(username || '').trim().slice(0, 32) || 'Anonymous';
    const targetIdStr = String(targetId);
    const accountId = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    await dbConnect();

    const comment = await Comment.create({
      targetType: String(targetType),
      targetId: targetIdStr,
      accountId,
      username: displayName,
      text: String(text).trim(),
    });

    // Emit notification for new comment
    try {
      await Notification.create({
        type: 'new_comment',
        title: '💬 New comment',
        message: `${displayName} commented on a ${targetType}.`,
        targetId: targetIdStr,
        targetType: String(targetType) as 'project' | 'file',
        targetName: displayName,
      });
    } catch { /* non-blocking */ }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Comment POST error:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to post comment', details },
      { status: 500 }
    );
  }
}
