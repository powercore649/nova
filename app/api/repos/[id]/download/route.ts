import { NextRequest, NextResponse } from 'next/server';
import db, { initRepoTables } from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await initRepoTables();

    const [repoRes, filesRes] = await Promise.all([
      db.execute({ sql: `SELECT * FROM repos WHERE id=? LIMIT 1`, args: [id] }),
      db.execute({ sql: `SELECT path, name, content, is_text FROM repo_files WHERE repo_id=?`, args: [id] }),
    ]);

    if (!repoRes.rows.length) return NextResponse.json({ error: 'Repo not found' }, { status: 404 });

    const repo = repoRes.rows[0] as any;
    const repoName = `${repo.owner_name}-${repo.name}`;
    const entries: { path: string; data: Uint8Array }[] = [];

    for (const file of filesRes.rows as any[]) {
      let data: Uint8Array;
      const content = String(file.content);
      if (file.is_text || !content.startsWith('data:')) {
        data = new TextEncoder().encode(content);
      } else {
        const base64 = content.split(',')[1] ?? '';
        data = Buffer.from(base64, 'base64');
      }
      entries.push({ path: `${repoName}/${file.path}`, data });
    }

    const hasReadme = entries.some(e => e.path.toLowerCase().endsWith('readme.md'));
    if (!hasReadme && repo.readme) {
      entries.push({ path: `${repoName}/README.md`, data: new TextEncoder().encode(String(repo.readme)) });
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
    return NextResponse.json({ error: 'Failed to create ZIP', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

function buildZip(entries: { path: string; data: Uint8Array }[]): ArrayBuffer {
  const parts: Uint8Array[] = [];
  const centralDir: Uint8Array[] = [];
  let offset = 0;
  const u16 = (n: number) => { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, n, true); return b; };
  const u32 = (n: number) => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; };
  const crcTable = (() => { const t = new Uint32Array(256); for (let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[i]=c;}return t;})();
  const crc32 = (d: Uint8Array) => { let c=0xffffffff; for(const b of d)c=crcTable[(c^b)&0xff]^(c>>>8); return(c^0xffffffff)>>>0; };
  const now=new Date(), dosDate=((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate(), dosTime=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1);
  for (const e of entries) {
    const nb=new TextEncoder().encode(e.path), crc=crc32(e.data), sz=e.data.length;
    const lh=concat([new Uint8Array([0x50,0x4b,0x03,0x04]),u16(20),u16(0),u16(0),u16(dosTime),u16(dosDate),u32(crc),u32(sz),u32(sz),u16(nb.length),u16(0),nb]);
    parts.push(lh); parts.push(e.data);
    centralDir.push(concat([new Uint8Array([0x50,0x4b,0x01,0x02]),u16(20),u16(20),u16(0),u16(0),u16(dosTime),u16(dosDate),u32(crc),u32(sz),u32(sz),u16(nb.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nb]));
    offset+=lh.byteLength+sz;
  }
  const cd=concat(centralDir);
  return concat([...parts,cd,concat([new Uint8Array([0x50,0x4b,0x05,0x06]),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(cd.byteLength),u32(offset),u16(0)])]).buffer as ArrayBuffer;
}

function concat(arrays: Uint8Array[]): Uint8Array {
  const total=arrays.reduce((s,a)=>s+a.byteLength,0), result=new Uint8Array(total); let pos=0;
  for(const a of arrays){result.set(a,pos);pos+=a.byteLength;} return result;
}
