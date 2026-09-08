import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Snippet from '@/models/Snippet';
import File from '@/models/File';
import { isAuthenticated } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    // Top projects by views
    const topProjects = await Snippet.find({})
      .sort({ views: -1 })
      .limit(10)
      .select('title views tags language createdAt')
      .lean();

    // Top files by downloads
    const topFiles = await File.find({})
      .sort({ downloads: -1 })
      .limit(10)
      .select('originalName downloads fileType fileSize createdAt')
      .lean();

    // Total stats
    const [totalProjects, totalFiles, viewsAgg, downloadsAgg] = await Promise.all([
      Snippet.countDocuments({}),
      File.countDocuments({}),
      Snippet.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      File.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]),
    ]);

    // Projects created per day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const projectsOverTime = await Snippet.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          views: { $sum: '$views' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      topProjects,
      topFiles,
      totals: {
        projects: totalProjects,
        files: totalFiles,
        views: viewsAgg[0]?.total ?? 0,
        downloads: downloadsAgg[0]?.total ?? 0,
      },
      projectsOverTime,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
