'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import JSZip from 'jszip';

interface RepoFile {
  file: File;
  relativePath: string;
  fromZip?: boolean;
}

function guessMime(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html': return 'text/html';
    case 'css': return 'text/css';
    case 'js': return 'application/javascript';
    case 'ts': return 'text/typescript';
    case 'tsx': return 'text/tsx';
    case 'json': return 'application/json';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'svg': return 'image/svg+xml';
    case 'md': return 'text/markdown';
    default: return 'text/plain';
  }
}

export default function RepoUploadPage() {
  const router = useRouter();
  const params = useParams();
  const repoId = params.id as string;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [entries, setEntries] = useState<RepoFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Handle standard file selection or ZIP extraction
  async function handleFiles(files: FileList | File[]) {
    setError(null);
    const newEntries: RepoFile[] = [];

    for (const file of Array.from(files)) {
      if (file.name.endsWith('.zip')) {
        try {
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(file);
          
          for (const [path, zipEntry] of Object.entries(zipContent.files)) {
            if (zipEntry.dir) continue;
            if (path.endsWith('/') || path.includes('__MACOSX') || path.includes('.DS_Store')) continue;
            
            const content = await zipEntry.async('uint8array');
            const standardBuffer = content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength);
            const blob = new Blob([standardBuffer]);
            const extractedFile = new File([blob], path.split('/').pop() || path, { type: guessMime(path) });
            newEntries.push({ file: extractedFile, relativePath: path, fromZip: true });
          }
        } catch (err) {
          console.error('Failed to parse ZIP file:', err);
          setError(`Failed to extract ZIP file: ${file.name}`);
        }
      } else {
        const relativePath = (file as any).webkitRelativePath || file.name;
        newEntries.push({ file, relativePath });
      }
    }

    setEntries(prev => [...prev, ...newEntries]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function removeEntry(index: number) {
    setEntries(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (entries.length === 0) {
      setError('Please select at least one file or folder to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('repoId', repoId);

      entries.forEach((entry) => {
        formData.append(`files`, entry.file);
        formData.append(`paths`, entry.relativePath);
      });

      const res = await fetch('/api/repos/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload repository files.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/repos/${repoId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setUploading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px', flex: 1 }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', fontWeight: 800 }}>
          Upload Repository Files
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Drop your project folder, individual source files, or a .zip archive to populate this repository.
        </p>

        {error && (
          <div style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#ef4444',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '1rem',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-primary)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            Files uploaded successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Dropzone */}
          <div
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? 'var(--accent-primary)' : 'var(--card-border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 2rem',
              textAlign: 'center',
              background: dragActive ? 'rgba(34, 197, 94, 0.05)' : 'var(--card-bg)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <input
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              Drag & drop files, folders, or ZIP archives here
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              or click to browse your computer
            </p>
          </div>

          {/* File list preview */}
          {entries.length > 0 && (
            <div className="glass-card-static" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>
                  Selected Files ({entries.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setEntries([])}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', color: '#ef4444' }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {entries.map((entry, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem'
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '1rem' }}>
                      {entry.relativePath}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEntry(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '1rem' }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading || entries.length === 0}
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
