'use client';

import { useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileEntry {
  file: File;
  relativePath: string;
}

export default function RepoUploadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error } = useToast();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [basePath, setBasePath] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const entries: FileEntry[] = [];
    for (const file of Array.from(newFiles)) {
      const relativePath = (file as any).webkitRelativePath || file.name;
      if (!files.some(f => f.relativePath === relativePath)) {
        entries.push({ file, relativePath });
      }
    }
    setFiles(prev => [...prev, ...entries]);
  }, [files]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

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
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded — ${data.sha?.slice(0, 7)}`);
      router.push(`/repos/${id}`);
    } catch (e: any) {
      error(e.message);
    } finally {
      setUploading(false);
    }
  }

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
          Drag & drop files or folders. Max 10 MB per file.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'var(--card-border)'}`,
            borderRadius: 'var(--radius-lg)',
            background: dragOver ? 'var(--accent-dim)' : 'var(--card-bg)',
            padding: '2.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'all var(--transition-base)',
          }}
        >
          <input ref={inputRef} type="file" multiple style={{ display: 'none' }}
            onChange={e => e.target.files && addFiles(e.target.files)} />
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={dragOver ? 'var(--accent-primary)' : 'var(--text-tertiary)'} strokeWidth="1.5" style={{ margin: '0 auto 0.75rem' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p style={{ fontWeight: 600, color: dragOver ? 'var(--accent-primary)' : 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            {dragOver ? 'Drop here!' : 'Drag & drop files here'}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>or click to browse</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="glass-card-static" style={{ marginBottom: '1.5rem', padding: '0', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{files.length} file{files.length > 1 ? 's' : ''} selected</span>
              <button onClick={() => setFiles([])} style={{ fontSize: '0.75rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Clear all</button>
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {files.map(({ file, relativePath }) => (
                <div key={relativePath} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                    {file.type.startsWith('image/') ? '🖼️' : file.name.endsWith('.md') ? '📝' : file.type.includes('zip') ? '🗜️' : '📄'}
                  </span>
                  <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                    {relativePath}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>{formatSize(file.size)}</span>
                  <button onClick={() => removeFile(relativePath)} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem', display: 'flex', alignItems: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
              Base folder path <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, textTransform: 'none' }}>(optional, e.g. src/utils)</span>
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
          <button onClick={upload} disabled={uploading || !files.length || !commitMessage.trim()} className="btn btn-primary"
            style={{ flex: 1, opacity: !files.length || !commitMessage.trim() ? 0.5 : 1 }}>
            {uploading ? 'Uploading…' : `Commit ${files.length} file${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </section>
    </main>
  );
}
