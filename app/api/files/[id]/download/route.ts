import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import File from '@/models/File';
import UserFile from '@/models/UserFile';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();

        // Try staff File first, then user uploads
        let file: any = await File.findById(id);
        let isUserFile = false;

        if (!file) {
            file = await UserFile.findById(id);
            isUserFile = true;
        }

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Increment download counter
        if (isUserFile) {
            await UserFile.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
        } else {
            await File.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
        }

        // Extract base64 data from data URL
        const matches = file.fileUrl.match(/^data:([^;]+);base64,(.+)$/);

        if (!matches) {
            return NextResponse.json({ error: 'Invalid file format' }, { status: 500 });
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = file.originalName || file.filename || 'download';

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `inline; filename="${fileName}"`,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json({
            error: 'Failed to serve file',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
