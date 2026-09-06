import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';

export const dynamic = 'force-dynamic';

// GET /api/profile/[username]/comments — public: get all comments by username
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  try {
    await dbConnect();
    const comments = await Comment.find({
      username: { $regex: new RegExp(`^${decoded}$`, 'i') },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Profile comments error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
