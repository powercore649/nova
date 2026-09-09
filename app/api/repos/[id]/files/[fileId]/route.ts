import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RepoFile from '@/models/RepoFile';
import RepoCommit from '@/models/RepoCommit';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET /api/repos/[id]/files/[fileId] — get file content
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  try {
    await dbConnect();
    const file = await RepoFile.findOne({ _id: fileId, repoId: id }).lean();
    if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ file });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// DELETE /api/repos/[id]/files/[fileId]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    const uploaderName = (body.uploaderName || 'Anonymous').slice(0, 32);

    await dbConnect();
    const file = await RepoFile.findOneAndDelete({ _id: fileId, repoId: id });
    if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Commit record for deletion
    await RepoCommit.create({
      repoId: id,
      message: `Delete ${file.path}`,
      uploaderName,
      uploaderId: '',
      filesChanged: [file.path],
      filesAdded: 0,
      filesModified: 0,
      filesDeleted: 1,
      sha: crypto.randomBytes(20).toString('hex'),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
