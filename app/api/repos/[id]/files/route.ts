import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Repo from '@/models/Repo';
import RepoFile from '@/models/RepoFile';
import RepoCommit from '@/models/RepoCommit';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET /api/repos/[id]/files?folder=src
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get('folder') ?? null;

  try {
    await dbConnect();
    const filter: any = { repoId: id };
    if (folder !== null) filter.folder = folder;

    const files = await RepoFile.find(filter)
      .sort({ folder: 1, name: 1 })
      .select('-content') // don't send content in listing
      .lean();

    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

// POST /api/repos/[id]/files — upload one or more files (multipart/form-data)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();

    const repo = await Repo.findById(id);
    if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 });

    const formData = await req.formData();
    const commitMessage = (formData.get('commitMessage') as string || 'Add files').slice(0, 200);
    const uploaderName = (formData.get('uploaderName') as string || 'Anonymous').slice(0, 32);
    const uploaderId = (formData.get('uploaderId') as string || `anon-${Date.now()}`).slice(0, 64);
    const basePath = (formData.get('basePath') as string || '').trim().replace(/^\/|\/$/g, '');

    const fileEntries = formData.getAll('files') as File[];
    const pathEntries = formData.getAll('paths') as string[]; // relative paths for each file

    if (!fileEntries.length) return NextResponse.json({ error: 'No files provided' }, { status: 400 });

    const TEXT_TYPES = [
      'text/', 'application/json', 'application/javascript', 'application/typescript',
      'application/xml', 'application/yaml', 'application/toml',
    ];

    const saved: any[] = [];
    const changedPaths: string[] = [];

    for (let i = 0; i < fileEntries.length; i++) {
      const file = fileEntries[i];
      const relativePath = pathEntries[i] || file.name;

      // Build full path
      const fullPath = basePath
        ? `${basePath}/${relativePath}`.replace(/\/+/g, '/')
        : relativePath;

      const parts = fullPath.split('/');
      const name = parts[parts.length - 1];
      const folder = parts.slice(0, -1).join('/');

      if (file.size > 10 * 1024 * 1024) continue; // skip files > 10MB

      const bytes = await file.arrayBuffer();
      const isText = TEXT_TYPES.some(t => file.type.startsWith(t)) || !file.type;
      let content: string;

      if (isText && file.size < 500 * 1024) {
        // Store as raw text
        content = new TextDecoder().decode(bytes);
      } else {
        // Store as base64
        content = `data:${file.type || 'application/octet-stream'};base64,${Buffer.from(bytes).toString('base64')}`;
      }

      // Upsert: replace existing file at same path
      const existing = await RepoFile.findOne({ repoId: id, path: fullPath });
      if (existing) {
        await RepoFile.findByIdAndUpdate(existing._id, {
          content, size: file.size, mimeType: file.type || 'application/octet-stream',
          isText, commitMessage, uploaderName, uploaderId,
        });
      } else {
        const created = await RepoFile.create({
          repoId: id, path: fullPath, name, folder,
          content, size: file.size, mimeType: file.type || 'application/octet-stream',
          isText, commitMessage, uploaderName, uploaderId,
        });
        saved.push(created);
      }
      changedPaths.push(fullPath);
    }

    // Create commit record
    const sha = crypto.randomBytes(20).toString('hex');
    await RepoCommit.create({
      repoId: id,
      message: commitMessage,
      uploaderName,
      uploaderId,
      filesChanged: changedPaths,
      filesAdded: saved.length,
      filesModified: fileEntries.length - saved.length,
      filesDeleted: 0,
      sha,
    });

    return NextResponse.json({ success: true, uploaded: fileEntries.length, sha });
  } catch (error) {
    console.error('Repo upload error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}
