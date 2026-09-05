import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

async function isAuthenticated(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return true;
  } catch {
    return false;
  }
}

// GET — public: returns current settings
export async function GET() {
  try {
    await dbConnect();
    // findOne or create default doc
    let settings = await Settings.findOne({}).lean();
    if (!settings) {
      settings = await Settings.create({ backgroundUrl: '', backgroundOpacity: 0.15 });
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PATCH — staff only: update backgroundUrl and/or backgroundOpacity
export async function PATCH(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { backgroundUrl, backgroundOpacity } = body;

    const update: Record<string, unknown> = {};
    if (typeof backgroundUrl === 'string') update.backgroundUrl = backgroundUrl;
    if (typeof backgroundOpacity === 'number') update.backgroundOpacity = Math.min(1, Math.max(0, backgroundOpacity));

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true }
    );

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
