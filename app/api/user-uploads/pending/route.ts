import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserFile from '@/models/UserFile';
import { isAuthenticated } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

// GET /api/user-uploads/pending — staff only: list all pending uploads
export async function GET(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const files = await UserFile.find({ status: 'pending' })
      .sort({ createdAt: 1 }) // oldest first
      .select('-fileUrl -thumbnailUrl') // don't send base64 in list
      .lean();
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Pending uploads error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
