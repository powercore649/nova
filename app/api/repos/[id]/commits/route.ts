import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RepoCommit from '@/models/RepoCommit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    const commits = await RepoCommit.find({ repoId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return NextResponse.json({ commits });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch commits' }, { status: 500 });
  }
}
