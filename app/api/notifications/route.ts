import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';

// GET /api/notifications?limit=20 — public feed (newest first)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  try {
    await dbConnect();
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/notifications — internal: create a notification (called server-side)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, title, message, targetId, targetType, targetName } = body;

    if (!type || !title || !targetId || !targetType || !targetName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    const notification = await Notification.create({
      type,
      title,
      message: message || '',
      targetId,
      targetType,
      targetName,
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Notification POST error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// PATCH /api/notifications — mark all as read (client calls this on bell open)
export async function PATCH() {
  try {
    await dbConnect();
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
