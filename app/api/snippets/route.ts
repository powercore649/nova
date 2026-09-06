import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Snippet from '@/models/Snippet';
import Notification from '@/models/Notification';
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

export async function POST(req: Request) {
    if (!(await isAuthenticated(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { title, description, code, language, tags, downloadUrl, youtubeUrl, accentColor } = await req.json();
        await dbConnect();

        const tagsArray = Array.isArray(tags) ? tags : tags?.split(',').map((t: string) => t.trim());

        const snippet = await Snippet.create({
            title,
            description,
            code,
            language,
            tags: tagsArray,
            downloadUrl,
            youtubeUrl,
            accentColor: accentColor || '',
        });

        // Emit notification for new project
        try {
            await Notification.create({
                type: 'new_project',
                title: '📦 New project published',
                message: `"${title}" was just added to the library.`,
                targetId: String(snippet._id),
                targetType: 'project',
                targetName: title,
            });
        } catch { /* non-blocking */ }

        return NextResponse.json({ success: true, snippet });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create snippet' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const snippets = await Snippet.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ snippets });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}
