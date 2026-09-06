'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Collection {
  _id: string;
  name: string;
  description: string;
  projectIds: string[];
  createdAt: string;
}

interface Comment {
  _id: string;
  targetType: 'project' | 'file';
  targetId: string;
  text: string;
  createdAt: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const decoded = decodeURIComponent(username);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'collections' | 'comments'>('collections');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/collections').then(r => r.json()).catch(() => ({ collections: [] })),
      fetch(`/api/profile/${encodeURIComponent(decoded)}/comments`).then(r => r.json()).catch(() => ({ comments: [] })),
    ]).then(([colData, comData]) => {
      // Filter collections by username
      const userCols: Collection[] = (colData.collections || []).filter(
        (c: any) => c.username?.toLowerCase() === decoded.toLowerCase()
      );
      setCollections(userCols);
      setComments(comData.comments || []);
      setLoading(false);
    });
  }, [decoded]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Profile header */}
      <section className="container animate-fadeIn" style={{ padding: '3rem 0 2rem' }}>
        <div className="glass-card-static" style={{
          display: 'flex', alignItems: 'center', gap: '1.5rem',
          padding: '1.5rem 2rem', borderRadius: 'var(--radius-lg)',
          flexWrap: 'wrap',
        }}>
          {/* Avatar */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 800, color: '#05130a',
            fontFamily: 'var(--font-display)', flexShrink: 0,
            boxShadow: 'var(--shadow-glow)',
          }}>
            {decoded.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              marginBottom: '0.25rem',
            }}>
              {decoded}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Community member
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {[
              { value: collections.length, label: 'Collections' },
              { value: comments.length, label: 'Comments' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)',
                  color: 'var(--accent-primary)', lineHeight: 1,
                }}>
                  {loading ? '—' : s.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container" style={{ paddingBottom: '5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['collections', 'comments'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tab === t ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', textTransform: 'capitalize' }}
            >
              {t === 'collections' ? `📚 Collections (${collections.length})` : `💬 Comments (${comments.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '72px', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : tab === 'collections' ? (
          collections.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
              <p style={{ color: 'var(--text-secondary)' }}>{decoded} hasn&apos;t created any collections yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {collections.map(col => (
                <Link key={col._id} href={`/collections/${col._id}`} className="glass-card"
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
                      {col.name}
                    </h3>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                      {col.projectIds.length} project{col.projectIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {col.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {col.description}
                    </p>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 'auto' }}>
                    {timeAgo(col.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          )
        ) : (
          comments.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💬</div>
              <p style={{ color: 'var(--text-secondary)' }}>{decoded} hasn&apos;t commented yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {comments.map(c => (
                <div key={c._id} className="glass-card-static" style={{
                  padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      {c.text}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ fontSize: '0.65rem' }}>{c.targetType}</span>
                      <Link href={c.targetType === 'project' ? `/project/${c.targetId}` : '/files'}
                        style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                        View {c.targetType} →
                      </Link>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '2px' }}>
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )
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
