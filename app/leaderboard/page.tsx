'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Project {
  _id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  views: number;
  downloadUrl?: string;
  createdAt: string;
}

interface FileEntry {
  _id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  downloads: number;
  createdAt: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'projects' | 'files'>('projects');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => { setProjects(d.projects || []); setFiles(d.files || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <nav className="glass-card-static" style={{
        margin: '1rem', borderRadius: 'var(--radius-full)',
        padding: '1rem 1.5rem', position: 'sticky', top: '1rem', zIndex: 1000,
        animation: 'slideDown 0.6s ease-out',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{
            fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'var(--font-display)',
            background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>nova-browser</Link>

          <div className="mobile-hidden" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {[['/', 'Home'], ['/browse', 'Browse'], ['/leaderboard', 'Leaderboard'], ['/roadmap', 'Roadmap'], ['/changelogs', 'Changelog'], ['/support', 'Support']].map(([href, label]) => (
              <Link key={href} href={href} style={{
                color: href === '/leaderboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: href === '/leaderboard' ? 600 : 500,
                transition: 'color var(--transition-fast)',
              }}>{label}</Link>
            ))}
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9rem' }}>Staff Login</Link>
          </div>

          <button className="desktop-hidden btn-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu" style={{ padding: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="desktop-hidden" style={{
            marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)',
            display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'slideDown 0.3s ease-out',
          }}>
            {[['/', 'Home'], ['/browse', 'Browse'], ['/leaderboard', 'Leaderboard'], ['/roadmap', 'Roadmap'], ['/changelogs', 'Changelog'], ['/support', 'Support']].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} style={{
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)', fontWeight: 500,
              }}>{label}</Link>
            ))}
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary"
              style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Staff Login</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="container animate-fadeIn" style={{ padding: '4rem 0 3rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', marginBottom: '1rem', padding: '0.5rem 1rem',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 'var(--radius-full)', color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600,
        }}>🏆 Leaderboard</div>
        <h1 style={{ fontSize: 'clamp(2.25rem, 6vw, 3.5rem)', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem' }}>
          Most <span className="gradient-text">popular</span> content
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
          Projects ranked by views, files ranked by downloads. Updated in real time.
        </p>
      </section>

      {/* Tabs */}
      <section className="container" style={{ paddingBottom: '5rem', maxWidth: '860px' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {(['projects', 'files'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={tab === t ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', textTransform: 'capitalize' }}>
              {t === 'projects' ? '👁 Projects by Views' : '⬇ Files by Downloads'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="glass-card-static" style={{ padding: '1.25rem' }}>
                <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '0.75rem' }} />
                <div className="skeleton" style={{ height: '14px', width: '70%' }} />
              </div>
            ))}
          </div>
        ) : tab === 'projects' ? (
          projects.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ color: 'var(--text-secondary)' }}>No projects yet. Check back soon.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {projects.map((p, i) => (
                <div key={p._id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem', cursor: 'default' }}>
                  {/* Rank */}
                  <div style={{ flexShrink: 0, width: '40px', textAlign: 'center' }}>
                    {i < 3 ? (
                      <span style={{ fontSize: '1.5rem' }}>{MEDALS[i]}</span>
                    ) : (
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-tertiary)' }}>#{i + 1}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
                        {p.title}
                      </h3>
                      {p.language && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{p.language}</span>}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
                      {p.views ?? 0}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>views</div>
                  </div>

                  {/* Action */}
                  <Link href={`/project/${p._id}`} className="btn btn-ghost"
                    style={{ flexShrink: 0, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                    View
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          )
        ) : (
          files.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ color: 'var(--text-secondary)' }}>No files yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {files.map((f, i) => (
                <div key={f._id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
                  <div style={{ flexShrink: 0, width: '40px', textAlign: 'center' }}>
                    {i < 3 ? <span style={{ fontSize: '1.5rem' }}>{MEDALS[i]}</span>
                      : <span style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-tertiary)' }}>#{i + 1}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.originalName}
                      </h3>
                      <span className="badge" style={{ fontSize: '0.65rem', flexShrink: 0 }}>{f.fileType}</span>
                    </div>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', margin: 0 }}>{formatSize(f.fileSize)}</p>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>{f.downloads}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>downloads</div>
                  </div>
                  <a href={`/api/files/${f._id}/download`} download={f.originalName} className="btn btn-secondary"
                    style={{ flexShrink: 0, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          )
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          © {new Date().getFullYear()} nova-browser. All rights reserved. —{' '}
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>Home</Link>
        </div>
      </footer>
    </main>
  );
}
