'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Totals {
  projects: number;
  files: number;
  views: number;
  downloads: number;
}

interface TopProject {
  _id: string;
  title: string;
  views: number;
  language: string;
  tags: string[];
}

interface TopFile {
  _id: string;
  originalName: string;
  downloads: number;
  fileType: string;
  fileSize: number;
}

interface DayPoint {
  _id: string; // YYYY-MM-DD
  count: number;
  views: number;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// Simple inline SVG bar chart
function BarChart({ data, color = '#22c55e' }: { data: DayPoint[]; color?: string }) {
  if (!data.length) return <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' }}>No data yet</div>;

  const max = Math.max(...data.map(d => d.views), 1);
  const last14 = data.slice(-14);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px', padding: '0 0.25rem' }}>
      {last14.map((d) => {
        const h = Math.max((d.views / max) * 80, d.views > 0 ? 4 : 0);
        return (
          <div key={d._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }} title={`${d._id}: ${d.views} views, ${d.count} projects`}>
            <div style={{
              width: '100%', height: `${h}px`,
              background: color,
              borderRadius: '3px 3px 0 0',
              opacity: 0.85,
              minHeight: d.views > 0 ? '4px' : '0',
              transition: 'height 0.4s var(--ease-fast)',
            }} />
          </div>
        );
      })}
    </div>
  );
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function AnalyticsPage() {
  const [data, setData] = useState<{
    totals: Totals;
    topProjects: TopProject[];
    topFiles: TopFile[];
    projectsOverTime: DayPoint[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => {
        if (r.status === 401) throw new Error('unauthorized');
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message === 'unauthorized' ? 'Staff access required.' : 'Failed to load analytics.'); setLoading(false); });
  }, []);

  return (
    <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Dashboard
          </Link>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
            Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Overview of your library performance</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#f87171', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-lg)' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '96px', borderRadius: 'var(--radius-lg)' }} />)}
          </div>
          <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      )}

      {data && !loading && (
        <>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Projects', value: formatNum(data.totals.projects), icon: '📦', color: '#22c55e', sub: 'published' },
              { label: 'Total Files',    value: formatNum(data.totals.files),    icon: '🗂️', color: '#818cf8', sub: 'uploaded' },
              { label: 'Total Views',    value: formatNum(data.totals.views),    icon: '👁',  color: '#fbbf24', sub: 'all time' },
              { label: 'Total Downloads',value: formatNum(data.totals.downloads),icon: '⬇️', color: '#34d399', sub: 'all time' },
            ].map(k => (
              <div key={k.label} className="glass-card-static" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `${k.color}12`, pointerEvents: 'none' }} />
                <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{k.icon}</div>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: k.color, lineHeight: 1, marginBottom: '0.25rem' }}>
                  {k.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{k.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginTop: '0.15rem' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Views over time */}
          <div className="glass-card-static" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '0.15rem' }}>Views over time</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Last 14 days · project views</p>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>30 day window</span>
            </div>
            <BarChart data={data.projectsOverTime} />
            {/* X-axis labels */}
            {data.projectsOverTime.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingLeft: '0.25rem' }}>
                {[data.projectsOverTime.at(-14), data.projectsOverTime.at(-7), data.projectsOverTime.at(-1)].filter(Boolean).map(d => (
                  <span key={d!._id} style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                    {new Date(d!._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Top tables */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Top projects */}
            <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--card-border)' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>👁 Top Projects by Views</h2>
              </div>
              <div>
                {data.topProjects.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No data yet</p>
                ) : data.topProjects.map((p, i) => (
                  <Link key={p._id} href={`/project/${p._id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      padding: '0.875rem 1.5rem',
                      borderBottom: i < data.topProjects.length - 1 ? '1px solid var(--card-border)' : 'none',
                      textDecoration: 'none', transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: i < 3 ? '1.1rem' : '0.85rem', flexShrink: 0, minWidth: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                      {i < 3 ? MEDALS[i] : `#${i + 1}`}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                      {p.language && <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>{p.language}</div>}
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fbbf24' }}>{formatNum(p.views)}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>views</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top files */}
            <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--card-border)' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>⬇ Top Files by Downloads</h2>
              </div>
              <div>
                {data.topFiles.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No data yet</p>
                ) : data.topFiles.map((f, i) => (
                  <div key={f._id}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.5rem', borderBottom: i < data.topFiles.length - 1 ? '1px solid var(--card-border)' : 'none' }}
                  >
                    <span style={{ fontSize: i < 3 ? '1.1rem' : '0.85rem', flexShrink: 0, minWidth: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                      {i < 3 ? MEDALS[i] : `#${i + 1}`}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.originalName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>{f.fileType} · {formatSize(f.fileSize)}</div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#34d399' }}>{formatNum(f.downloads)}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>downloads</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
