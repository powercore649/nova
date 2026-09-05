import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Snippet from '@/models/Snippet';
import File from '@/models/File';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    const [projects, files] = await Promise.all([
      Snippet.find({})
        .select('title description language tags views downloadUrl createdAt')
        .sort({ views: -1 })
        .limit(20)
        .lean(),
      File.find({})
        .select('originalName fileType fileSize downloads createdAt')
        .sort({ downloads: -1 })
        .limit(10)
        .lean(),
    ]);

    return NextResponse.json({ projects, files });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ projects: [], files: [] }, { status: 500 });
  }
}
