import Link from 'next/link';
import dbConnect from '@/lib/db';
import File from '@/models/File';
import UserFile from '@/models/UserFile';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import FileDetailClient from '@/components/FileDetailClient';

export const dynamic = 'force-dynamic';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function getFile(id: string) {
  try {
    await dbConnect();
    let file: any = await File.findById(id).lean();
    if (!file) file = await UserFile.findById(id).lean();
    return file;
  } catch {
    return null;
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://novacorpbumpify.dpdns.org';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const file: any = await getFile(id);
  if (!file) return { title: 'File not found' };

  const name = file.originalName || file.filename || 'File';
  const accent = file.accentColor || '#22c55e';
  const desc = `${file.fileType === 'zip' ? '🗜️ ZIP archive' : '🖼️ Image'} — ${formatSize(file.fileSize)} · Download on nova-browser`;

  return {
    title: name,
    description: desc,
    openGraph: {
      title: name,
      description: desc,
      siteName: 'nova-browser',
      type: 'article',
      url: `${SITE_URL}/files/${id}`,
      images: [{
        url: file.fileType === 'image' && file.thumbnailUrl?.startsWith('http')
          ? file.thumbnailUrl
          : `${SITE_URL}/api/og?title=${encodeURIComponent(name)}&description=${encodeURIComponent(desc)}&accent=${encodeURIComponent(accent)}`,
        width: 1200,
        height: 630,
        alt: name,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: desc,
    },
  };
}

export default async function FileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file: any = await getFile(id);

  if (!file) notFound();

  // Serialize for client
  const serialized = JSON.parse(JSON.stringify(file));

  return <FileDetailClient file={serialized} />;
}
