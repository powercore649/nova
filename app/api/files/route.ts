import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import File from '@/models/File';
import UserFile from '@/models/UserFile';

export const dynamic = 'force-dynamic';

// GET: List all files (staff files + approved user uploads)
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const [staffFiles, userFiles] = await Promise.all([
            File.find({}).sort({ createdAt: -1 }).lean(),
            UserFile.find({ status: 'approved' }).sort({ createdAt: -1 }).lean(),
        ]);

        // Normalize userFiles to match File shape
        const normalizedUserFiles = userFiles.map((f: any) => ({
            _id: f._id,
            filename: `user-${f._id}`,
            originalName: f.originalName,
            fileUrl: f.fileUrl,
            fileType: f.fileType,
            mimeType: f.mimeType,
            fileSize: f.fileSize,
            thumbnailUrl: f.thumbnailUrl || '',
            youtubeUrl: '',
            uploadedBy: f.uploaderName || 'Community',
            downloads: f.downloads || 0,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
            _source: 'user', // flag to distinguish if needed
        }));

        // Merge and sort by date
        const allFiles = [...staffFiles, ...normalizedUserFiles].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ files: allFiles }, { status: 200 });
    } catch (error) {
        console.error('Error fetching files:', error);
        return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
}

// POST: Create file record (called after upload)
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { filename, originalName, fileUrl, fileType, mimeType, fileSize, thumbnailUrl } = body;

        const file = await File.create({
            filename,
            originalName,
            fileUrl,
            fileType,
            mimeType,
            fileSize,
            thumbnailUrl: thumbnailUrl || '',
            uploadedBy: 'staff',
            downloads: 0
        });

        return NextResponse.json({ file }, { status: 201 });
    } catch (error) {
        console.error('Error creating file:', error);
        return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
    }
}

// DELETE: Delete file
export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'File ID required' }, { status: 400 });
        }

        const result = await File.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({
            error: 'Failed to delete file',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
