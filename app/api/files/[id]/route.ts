import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import File from '@/models/File';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/auth-config';

// Helper to check auth
async function isAuthenticated(req: Request) {
    const cookie = req.headers.get('cookie');
    const token = cookie?.split('token=')[1]?.split(';')[0];
    if (!token) return false;
    try {
        await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        return true;
    } catch {
        return false;
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await dbConnect();
        const file = await File.findById(id);
        if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ file });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!(await isAuthenticated(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { youtubeUrl, accentColor } = await req.json();
        await dbConnect();

        const file = await File.findByIdAndUpdate(
            id,
            { youtubeUrl, accentColor: accentColor || '' },
            { new: true }
        );

        if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true, file });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
