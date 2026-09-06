'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

interface Bookmark {
  _id: string;
  targetType: 'project' | 'file';
  targetId: string;
  createdAt: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
}

interface FileItem {
  _id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getVoterKey(): string {
  if (typeof window === 'undefined') return '';
  let key = localStorage.getItem('nova-voter-key');
  if (!key) {
    key = `voter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('nova-voter-key', key);
  }
  return key;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [projects, setProjects] = useState<Map<string, Project>>(new Map());
  const [files, setFiles] = useState<Map<string, FileItem>>(new Map());
  const [loading, setLoading] = useState(true);
  const [voterKey, setVoterKey] = useState('');

  useEffect(() => {
    const key = getVoterKey();
    setVoterKey(key);

    Promise.all([
      fetch(`/api/favorites?voterKey=${encodeURIComponent(key)}&targetType=project`).then(r => r.json()),
      fetch(`/api/favorites?voterKey=${encodeURIComponent(key)}&targetType=file`).then(r => r.json()),
      fetch('/api/snippets').then(r => r.json()),
      fetch('/api/files').then(r => r.json()),
    ]).then(([projFavs, fileFavs, snippetsData, filesData]) => {
      const all: Bookmark[] = [
        ...(projFavs.favorites || []),
        ...(fileFavs.favorites || []),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookmarks(all);

      const pMap = new Map<string, Project>();
      for (const s of (snippetsData.snippets || [])) pMap.set(String(s._id), s);
      setProjects(pMap);

      const fMap = new Map<string, FileItem>();
      for (const f of (filesData.files || [])) fMap.set(String(f._id), f);
      setFiles(fMap);

      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function removeBookmark(bm: Bookmark) {
    const key = getVoterKey();
    await fetch(`/api/favorites?targetType=${bm.targetType}&targetId=${bm.targetId}&voterKey=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    setBookmarks(prev => prev.filter(b => !(b.targetId === bm.targetId && b.targetType === bm.targetType)));
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section className="container animate-fadeIn" style={{ padding: '3.5rem 0 2rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', marginBottom: '1rem', padding: '0.5rem 1rem',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 'var(--radius-full)', color: '#fbbf24', fontSize: '0.875rem', fontWeight: 600,
        }}>
          🔖 Your Bookmarks
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.75rem' }}>
          Saved items
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          Projects and files you&apos;ve bookmarked. Saved to this device.
        </p>
      </section>

      <section className="container" style={{ paddingBottom: '5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No bookmarks yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Click the bookmark icon on any project or file to save it here.
            </p>
            <Link href="/browse" className="btn btn-primary">Browse Library</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {bookmarks.map(bm => {
              const isProject = bm.targetType === 'project';
              const proj = isProject ? projects.get(bm.targetId) : null;
              const file = !isProject ? files.get(bm.targetId) : null;
              const name = proj?.title || file?.originalName || 'Unknown';

              return (
                <div key={`${bm.targetType}-${bm.targetId}`} className="glass-card-static" style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>
                    {isProject ? '📦' : file?.fileType === 'image' ? '🖼️' : '🗜️'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ fontSize: '0.65rem' }}>{bm.targetType}</span>
                      {file?.fileSize && <span>{formatSize(file.fileSize)}</span>}
                      {proj?.language && <span>{proj.language}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <Link
                      href={isProject ? `/project/${bm.targetId}` : '/files'}
                      className="btn btn-ghost"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      View →
                    </Link>
                    <button
                      onClick={() => removeBookmark(bm)}
                      title="Remove bookmark"
                      style={{
                        padding: '0.4rem 0.6rem',
                        background: 'rgba(248,113,113,0.08)',
                        border: '1px solid rgba(248,113,113,0.25)',
                        borderRadius: 'var(--radius-md)',
                        color: '#f87171', cursor: 'pointer', fontSize: '0.8rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          © {new Date().getFullYear()} nova-browser —{' '}
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>Home</Link>
        </div>
      </footer>
    </main>
  );
}
