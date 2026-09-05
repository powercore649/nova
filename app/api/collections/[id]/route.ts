import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Collection from '@/models/Collection';

export const dynamic = 'force-dynamic';

// GET /api/collections/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    const collection = await Collection.findById(id).lean();
    if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ collection });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}

// PATCH /api/collections/[id] — add or remove a project
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { action, projectId } = body; // action: 'add' | 'remove'

    if (!projectId || !['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await dbConnect();
    const update = action === 'add'
      ? { $addToSet: { projectIds: projectId } }
      : { $pull: { projectIds: projectId } };

    const collection = await Collection.findByIdAndUpdate(id, update, { new: true });
    if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ collection });
  } catch {
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

// DELETE /api/collections/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    await Collection.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
