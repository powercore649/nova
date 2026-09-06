'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  _id: string;
  kind: 'project' | 'file';
  title?: string;
  originalName?: string;
  description?: string;
  language?: string;
  tags?: string[];
}

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Open on "/" key (not in input/textarea)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelected(0);
    }
  }, [open]);

  // Search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [snippets, files] = await Promise.all([
          fetch('/api/snippets').then(r => r.json()),
          fetch('/api/files').then(r => r.json()),
        ]);
        const q = query.toLowerCase();
        const projects: SearchResult[] = (snippets.snippets || [])
          .filter((s: any) =>
            s.title?.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q) ||
            s.tags?.some((t: string) => t.toLowerCase().includes(q))
          )
          .slice(0, 5)
          .map((s: any) => ({ ...s, kind: 'project' as const }));

        const fileResults: SearchResult[] = (files.files || [])
          .filter((f: any) => f.originalName?.toLowerCase().includes(q))
          .slice(0, 3)
          .map((f: any) => ({ ...f, kind: 'file' as const }));

        setResults([...projects, ...fileResults]);
        setSelected(0);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Arrow nav + Enter
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && results[selected]) {
        e.preventDefault();
        const r = results[selected];
        router.push(r.kind === 'project' ? `/project/${r._id}` : '/files');
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, results, selected, router]);

  if (!open) {
    return (
      /* Hint badge — bottom right */
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.4rem 0.8rem',
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-full)',
        color: 'var(--text-tertiary)', fontSize: '0.72rem',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        backdropFilter: 'blur(8px)',
      }}
        onClick={() => setOpen(true)}
        title="Press / to search"
      >
        <kbd style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', padding: '0.1rem 0.35rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '4px', color: 'var(--text-secondary)' }}>/</kbd>
        Search
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 9000,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(580px, 92vw)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        zIndex: 9001,
        overflow: 'hidden',
        animation: 'slideDown 0.15s ease-out',
      }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--card-border)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search projects and files…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '1rem', fontFamily: 'inherit',
            }}
          />
          {loading && (
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--card-border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 0.6s linear infinite' }} />
          )}
          <kbd onClick={() => setOpen(false)} style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '4px', color: 'var(--text-tertiary)', cursor: 'pointer' }}>Esc</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {results.length === 0 && query.trim() && !loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.length === 0 && !query.trim() && (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', margin: 0 }}>Quick links</p>
              {[['/', 'Home'], ['/browse', 'Browse Library'], ['/files', 'Files'], ['/upload', 'Upload a file'], ['/collections', 'Collections']].map(([href, label]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)', fontSize: '0.9rem',
                  transition: 'background var(--transition-fast)',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
          {results.map((r, i) => {
            const label = r.kind === 'project' ? r.title : r.originalName;
            const href = r.kind === 'project' ? `/project/${r._id}` : '/files';
            return (
              <Link key={r._id} href={href} onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.75rem 1.25rem',
                  background: i === selected ? 'var(--card-bg)' : 'transparent',
                  borderLeft: i === selected ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                }}
                onMouseEnter={() => setSelected(i)}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
                  {r.kind === 'project' ? '📦' : '🗂️'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label}
                  </div>
                  {r.description && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.description}
                    </div>
                  )}
                </div>
                <span className="badge" style={{ fontSize: '0.65rem', flexShrink: 0 }}>{r.kind}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.6rem 1.25rem', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {[['↑↓', 'Navigate'], ['↵', 'Open'], ['Esc', 'Close']].map(([key, label]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              <kbd style={{ fontFamily: 'var(--font-display)', padding: '0.1rem 0.4rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '4px', color: 'var(--text-secondary)' }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
