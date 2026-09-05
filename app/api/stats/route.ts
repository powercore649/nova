import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Snippet from '@/models/Snippet';
import File from '@/models/File';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        const [projectCount, fileCount, downloadAgg] = await Promise.all([
            Snippet.countDocuments({}),
            File.countDocuments({}),
            File.aggregate([
                { $group: { _id: null, total: { $sum: '$downloads' } } },
            ]),
        ]);

        const downloads = downloadAgg[0]?.total ?? 0;

        return NextResponse.json({ projects: projectCount, files: fileCount, downloads });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ projects: 0, files: 0, downloads: 0 }, { status: 500 });
    }
}
