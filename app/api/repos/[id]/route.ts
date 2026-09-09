import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Repo from '@/models/Repo';
import RepoFile from '@/models/RepoFile';
import RepoCommit from '@/models/RepoCommit';

export const dynamic = 'force-dynamic';

// GET /api/repos/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    const repo = await Repo.findById(id).lean();
    if (!repo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if ((repo as any).visibility === 'private') {
      // Could add owner check here — for now private repos are viewable by URL
    }
    return NextResponse.json({ repo });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PATCH /api/repos/[id] — update description, readme, visibility
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { description, readme, visibility, stars } = body;
    const update: any = {};
    if (description !== undefined) update.description = String(description).slice(0, 500);
    if (readme !== undefined) update.readme = String(readme);
    if (visibility !== undefined) update.visibility = visibility === 'private' ? 'private' : 'public';
    if (typeof stars === 'number') update.stars = stars;

    await dbConnect();
    const repo = await Repo.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!repo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ repo });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/repos/[id] — delete repo + all files + commits
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    await Promise.all([
      Repo.findByIdAndDelete(id),
      RepoFile.deleteMany({ repoId: id }),
      RepoCommit.deleteMany({ repoId: id }),
    ]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
