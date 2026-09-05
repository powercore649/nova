import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export const dynamic = 'force-dynamic';

// GET — public: returns current settings
export async function GET() {
  try {
    await dbConnect();
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

// PATCH — public: update backgroundOpacity (backgroundUrl is set via /api/settings/background)
export async function PATCH(req: NextRequest) {
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
