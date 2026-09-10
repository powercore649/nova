'use client';

import { useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { unzip } from 'fflate';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileEntry {
  file: File;
  relativePath: string;
  fromZip?: boolean;
}

/** Extract a ZIP file into FileEntry[] using fflate (client-side) */
async function extractZip(zipFile: File): Promise<FileEntry[]> {
  const buffer = await zipFile.arrayBuffer();
  const data = new Uint8Array(buffer);

  return new Promise((resolve, reject) => {
    unzip(data, (err, files) => {
      if (err) { reject(err); return; }
      const entries: FileEntry[] = [];
      for (const [path, content] of Object.entries(files)) {
        // Skip directories (end with /) and __MACOSX junk
        if (path.endsWith('/') || path.includes('__MACOSX') || path.includes('.DS_Store')) continue;
        
        // Convert Uint8Array to Blob safely
        const blob = new Blob([content as Uint8Array]);
        const fileName = path.split('/').pop() || path;
        const file = new File([blob], fileName, { type: guessMime(path) });
        
        entries.push({ file, relativePath: path, fromZip: true });
      }
      resolve(entries);
    });
  });
}

function guessMime(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'text/javascript', ts: 'text/typescript', tsx: 'text/typescript',
    jsx: 'text/javascript', html: 'text/html', css: 'text/css',
    json: 'application/json', md: 'text/markdown', txt: 'text/plain',
    py: 'text/x-python', rs: 'text/x-rust', go: 'text/x-go',
    java: 'text/x-java', c: 'text/x-c', cpp: 'text/x-c++',
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
    pdf: 'application/pdf', zip: 'application/zip',
    toml: 'application/toml', yaml: 'text/yaml', yml: 'text/yaml',
    xml: 'application/xml', sh: 'text/x-sh', bat: 'text/x-bat',
  };
  return map[ext] || 'application/octet-stream';
}

export default function RepoUploadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error, info } = useToast();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [basePath, setBasePath] = useState('');
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (newFiles: FileList | File[]) => {
    const entries: FileEntry[] = [];
    const fileArr = Array.from(newFiles);

    for (const file of fileArr) {
      const isZip = file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';

      if (isZip) {
        setExtracting(true);
        try {
          info(`Extracting ${file.name}…`);
          const extracted = await extractZip(file);
          const stripped = stripCommonRoot(extracted);
          for (const e of stripped) {
            if (!files.some(f => f.relativePath === e.relativePath)) {
              entries.push(e);
            }
          }
          success(`Extracted ${extracted.length} files from ${file.name}`);
        } catch (e: any) {
          error(`Failed to extract ${file.name}: ${e.message}`);
        } finally {
          setExtracting(false);
        }
      } else {
        const relativePath = (file as any).webkitRelativePath || file.name;
        if (!files.some(f => f.relativePath === relativePath)) {
          entries.push({ file, relativePath });
        }
      }
    }

    if (entries.length) setFiles(prev => [...prev, ...entries]);
  }, [files, error, info, success]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  function removeFile(path: string) {
    setFiles(prev => prev.filter(f => f.relativePath !== path));
  }

  async function upload() {
    if (!files.length) { error('No files selected'); return; }
    if (!commitMessage.trim()) { error('Commit message is required'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('commitMessage', commitMessage.trim());
      formData.append('uploaderName', uploaderName.trim() || 'Anonymous');
      formData.append('basePath', basePath.trim());
      for (const entry of files) {
        formData.append('files', entry.file);
        formData.append('paths', entry.relativePath);
      }
      const res = await fetch(`/api/repos/${id}/files`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Upload failed');
      success(`${files.length} file${files.length > 1 ? 's' : ''} committed — ${data.sha?.slice(0, 7)}`);
      router.push(`/repos/${id}`);
    } catch (e: any) {
      error(e.message);
    } finally {
      setUploading(false);
    }
  }

  const zipCount = files.filter(f => f.fromZip).length;
  const directCount = files.length - zipCount;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <section className="container animate-fadeIn" style={{ padding: '2.5rem 0 5rem', maxWidth: '760px' }}>

        <Link href={`/repos/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to repository
        </Link>

        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.4rem' }}>
          Upload files
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Drag & drop files, folders, or a <strong style={{ color: 'var(--accent-primary)' }}>ZIP archive</strong> — it will be extracted automatically.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !extracting && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent-primary)' : extracting ? 'rgba(251,191,36,0.5)' : 'var(--card-border)'}`,
            borderRadius: 'var(--radius-lg)',
            background: dragOver ? 'var(--accent-dim)' : extracting ? 'rgba(251,191,36,0.05)' : 'var(--card-bg)',
            padding: '2.5rem',
            textAlign: 'center',
            cursor: extracting ? 'wait' : 'pointer',
            marginBottom: '1.5rem',
            transition: 'all var(--transition-base)',
          }}
        >
          <input ref={inputRef} type="file" multiple accept="*/*,.zip" style={{ display: 'none' }}
            onChange={e => e.target.files && processFiles(e.target.files)} />

          {extracting ? (
            <>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--card-border)', borderTopColor: '#fbbf24', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: 600, color: '#fbbf24', marginBottom: '0.25rem' }}>Extracting ZIP…</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Please wait</p>
            </>
          ) : (
            <>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={dragOver ? 'var(--accent-primary)' : 'var(--text-tertiary)'} strokeWidth="1.5" style={{ margin: '0 auto 0.75rem', display: 'block' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p style={{ fontWeight: 600, color: dragOver ? 'var(--accent-primary)' : 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {dragOver ? 'Drop here!' : 'Drag & drop files or a ZIP archive'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['Files', 'Folders', '.zip'].map(t => (
                  <span key={t} className="badge" style={{ fontSize: '0.7rem' }}>{t}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="glass-card-static" style={{ marginBottom: '1.5rem', padding: '0', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {files.length} file{files.length > 1 ? 's' : ''}
                </span>
                {zipCount > 0 && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>🗜️ {zipCount} from ZIP</span>}
                {directCount > 0 && <span className="badge" style={{ fontSize: '0.65rem' }}>📄 {directCount} direct</span>}
              </div>
              <button onClick={() => setFiles([])} style={{ fontSize: '0.75rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Clear all</button>
            </div>
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {files.map(({ file, relativePath, fromZip }) => (
                <div key={relativePath} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 1.25rem', borderBottom: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>
                    {file.type.startsWith('image/') ? '🖼️' : relativePath.endsWith('.md') ? '📝' : fromZip ? '📦' : '📄'}
                  </span>
                  <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                    {relativePath}
                  </span>
                  {fromZip && <span style={{ fontSize: '0.62rem', color: 'var(--accent-primary)', flexShrink: 0 }}>zip</span>}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>{formatSize(file.size)}</span>
                  <button onClick={() => removeFile(relativePath)} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem', display: 'flex', alignItems: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Base folder path <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, textTransform: 'none' }}>(optional — e.g. src/utils)</span>
            </label>
            <input value={basePath} onChange={e => setBasePath(e.target.value)} placeholder="Leave empty for root"
              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--font-mono)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Your name <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </label>
            <input value={uploaderName} onChange={e => setUploaderName(e.target.value)} placeholder="Anonymous" maxLength={32}
              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Commit message *
            </label>
            <input value={commitMessage} onChange={e => setCommitMessage(e.target.value)} placeholder="Add initial files" maxLength={200}
              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href={`/repos/${id}`} className="btn btn-ghost">Cancel</Link>
          <button onClick={upload} disabled={uploading || extracting || !files.length || !commitMessage.trim()} className="btn btn-primary"
            style={{ flex: 1, opacity: !files.length || !commitMessage.trim() ? 0.5 : 1 }}>
            {uploading ? 'Uploading…' : extracting ? 'Extracting…' : `Commit ${files.length} file${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </section>
    </main>
  );
}

/** Strip common root folder from ZIP paths (e.g. "project-main/src/..." → "src/...") */
function stripCommonRoot(entries: FileEntry[]): FileEntry[] {
  if (!entries.length) return entries;
  const parts = entries[0].relativePath.split('/');
  if (parts.length < 2) return entries;
  const root = parts[0];
  const allShareRoot = entries.every(e => e.relativePath.startsWith(root + '/'));
  if (!allShareRoot) return entries;
  return entries.map(e => ({ ...e, relativePath: e.relativePath.slice(root.length + 1) }));
}
