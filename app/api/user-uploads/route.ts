import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserFile from '@/models/UserFile';

export const dynamic = 'force-dynamic';

// GET — public: list approved uploads only
export async function GET() {
  try {
    await dbConnect();
    const files = await UserFile.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .select('-fileUrl -thumbnailUrl') // don't send base64 in list
      .lean();
    return NextResponse.json({ files });
  } catch (error) {
    console.error('UserUploads GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
  }
}

// POST — public: submit a file for review
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const uploaderName = (formData.get('uploaderName') as string || '').trim().slice(0, 64) || 'Anonymous';
    const uploaderNote = (formData.get('uploaderNote') as string || '').trim().slice(0, 500);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isImage = file.type.startsWith('image/');
    const isZip = file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.endsWith('.zip');

    if (!isImage && !isZip) {
      return NextResponse.json({ error: 'Only images and ZIP files are accepted' }, { status: 400 });
    }

    // 25 MB limit for user uploads
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 25 MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    await dbConnect();

    const userFile = await UserFile.create({
      originalName: file.name,
      fileUrl: dataUrl,
      fileType: isImage ? 'image' : 'zip',
      mimeType: file.type,
      fileSize: file.size,
      thumbnailUrl: isImage ? dataUrl : '',
      uploaderName,
      uploaderNote,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      message: 'File submitted for review. Staff will approve it shortly.',
      id: userFile._id,
    }, { status: 201 });
  } catch (error) {
    console.error('UserUploads POST error:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Upload failed', details }, { status: 500 });
  }
}
