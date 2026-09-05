import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserFile from '@/models/UserFile';
import { isAuthenticated } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

// GET /api/user-uploads/[id] — get single upload (staff only for pending/rejected)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    const file = await UserFile.findById(id).lean();
    if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ file });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PATCH /api/user-uploads/[id] — staff: approve or reject
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { status, reviewNote } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 });
    }

    await dbConnect();
    const file = await UserFile.findByIdAndUpdate(
      id,
      { $set: { status, reviewNote: reviewNote || '' } },
      { new: true }
    );

    if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, file });
  } catch (error) {
    console.error('UserUpload PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/user-uploads/[id] — staff only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    await dbConnect();
    await UserFile.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
