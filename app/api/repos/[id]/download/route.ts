import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Repo from '@/models/Repo';
import RepoFile from '@/models/RepoFile';

export const dynamic = 'force-dynamic';

// GET /api/repos/[id]/download — stream a ZIP of all repo files
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();

    const [repo, files] = await Promise.all([
      Repo.findById(id).lean(),
      RepoFile.find({ repoId: id }).lean(),
    ]);

    if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 });

    // Build a simple ZIP in pure JS (no dependencies)
    // Using the ZIP spec directly
    const repoName = `${(repo as any).ownerName}-${(repo as any).name}`;

    const entries: { path: string; data: Uint8Array }[] = [];

    for (const file of files) {
      const f = file as any;
      let data: Uint8Array;

      if (f.isText || !f.content.startsWith('data:')) {
        data = new TextEncoder().encode(f.content);
      } else {
        // base64 data URL
        const base64 = f.content.split(',')[1] ?? '';
        data = Buffer.from(base64, 'base64');
      }

      entries.push({ path: `${repoName}/${f.path}`, data });
    }

    // Add README if not already a file
    const hasReadme = entries.some(e => e.path.toLowerCase().endsWith('readme.md'));
    if (!hasReadme && (repo as any).readme) {
      entries.push({ path: `${repoName}/README.md`, data: new TextEncoder().encode((repo as any).readme) });
    }

    const zipBytes = buildZip(entries);

    return new NextResponse(zipBytes, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${repoName}.zip"`,
        'Content-Length': String(zipBytes.byteLength),
      },
    });
  } catch (error) {
    console.error('ZIP error:', error);
    return NextResponse.json({ error: 'Failed to create ZIP' }, { status: 500 });
  }
}

/** Pure JS ZIP builder — no dependencies */
function buildZip(entries: { path: string; data: Uint8Array }[]): ArrayBuffer {
  const parts: Uint8Array[] = [];
  const centralDir: Uint8Array[] = [];
  let offset = 0;

  function u16(n: number) {
    const b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, n, true);
    return b;
  }
  function u32(n: number) {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, n, true);
    return b;
  }

  // Simple CRC-32
  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })();

  function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (const b of data) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  const now = new Date();
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);

  for (const entry of entries) {
    const nameBytes = new TextEncoder().encode(entry.path);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    // Local file header
    const localHeader = concat([
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]), // signature
      u16(20), u16(0), u16(0),                   // version, flags, compression (store)
      u16(dosTime), u16(dosDate),                // time, date
      u32(crc), u32(size), u32(size),            // crc, compressed, uncompressed
      u16(nameBytes.length), u16(0),             // name len, extra len
      nameBytes,
    ]);

    parts.push(localHeader);
    parts.push(entry.data);

    // Central directory entry
    const cdEntry = concat([
      new Uint8Array([0x50, 0x4b, 0x01, 0x02]),
      u16(20), u16(20), u16(0), u16(0),
      u16(dosTime), u16(dosDate),
      u32(crc), u32(size), u32(size),
      u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0),
      u32(0), u32(offset),
      nameBytes,
    ]);
    centralDir.push(cdEntry);
    offset += localHeader.byteLength + size;
  }

  const cdBytes = concat(centralDir);
  const eocd = concat([
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]),
    u16(0), u16(0),
    u16(entries.length), u16(entries.length),
    u32(cdBytes.byteLength), u32(offset),
    u16(0),
  ]);

  return concat([...parts, cdBytes, eocd]).buffer as ArrayBuffer;
}

function concat(arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.byteLength, 0);
  const result = new Uint8Array(total);
  let pos = 0;
  for (const a of arrays) { result.set(a, pos); pos += a.byteLength; }
  return result;
}
