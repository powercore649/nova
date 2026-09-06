'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Account {
  accountId: string;
  username: string;
}

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
  const router = useRouter();

  const [me, setMe] = useState<Account | null | undefined>(undefined); // undefined = loading
  const [collections, setCollections] = useState<Collection[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'collections' | 'comments'>('collections');

  // 1. Check auth first
  useEffect(() => {
    fetch('/api/account/me')
      .then(r => r.json())
      .then(d => setMe(d.account ?? null))
      .catch(() => setMe(null));
  }, []);

  // 2. Once auth resolved, guard: must be logged in AND viewing own profile
  useEffect(() => {
    if (me === undefined) return; // still loading
    if (!me) {
      router.replace(`/signin?redirect=/profile/${encodeURIComponent(decoded)}`);
      return;
    }
    // Can only view own profile
    if (me.username.toLowerCase() !== decoded.toLowerCase()) {
      router.replace(`/profile/${encodeURIComponent(me.username)}`);
      return;
    }
    // Load data
    setLoading(true);
    Promise.all([
      fetch('/api/collections').then(r => r.json()).catch(() => ({ collections: [] })),
      fetch(`/api/profile/${encodeURIComponent(decoded)}/comments`).then(r => r.json()).catch(() => ({ comments: [] })),
    ]).then(([colData, comData]) => {
      const userCols: Collection[] = (colData.collections || []).filter(
        (c: any) => c.username?.toLowerCase() === decoded.toLowerCase()
      );
      setCollections(userCols);
      setComments(comData.comments || []);
      setLoading(false);
    });
  }, [me, decoded, router]);

  async function handleLogout() {
    await fetch('/api/account/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  // Auth still loading
  if (me === undefined) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '120px', height: '24px', borderRadius: 'var(--radius-md)' }} />
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Profile header */}
      <section className="container animate-fadeIn" style={{ padding: '3rem 0 2rem' }}>
        <div className="glass-card-static" style={{
          display: 'flex', alignItems: 'center', gap: '1.5rem',
          padding: '1.5rem 2rem', borderRadius: 'var(--radius-lg)', flexWrap: 'wrap',
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
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '0.25rem' }}>
              {decoded}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Community member
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { value: collections.length, label: 'Collections' },
              { value: comments.length, label: 'Comments' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-primary)', lineHeight: 1 }}>
                  {loading ? '—' : s.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}

            {/* Logout */}
            <button onClick={handleLogout} className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </section>

      {/* Tabs + content */}
      <section className="container" style={{ paddingBottom: '5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {(['collections', 'comments'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={tab === t ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              {t === 'collections' ? `📚 Collections (${collections.length})` : `💬 Comments (${comments.length})`}
            </button>
          ))}
          <Link href="/bookmarks" className="btn btn-ghost" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', marginLeft: 'auto' }}>
            🔖 My Bookmarks
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '72px', borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : tab === 'collections' ? (
          collections.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You haven&apos;t created any collections yet.</p>
              <Link href="/collections" className="btn btn-primary">Browse Collections</Link>
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
              <p style={{ color: 'var(--text-secondary)' }}>You haven&apos;t commented yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {comments.map(c => (
                <div key={c._id} className="glass-card-static" style={{
                  padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{c.text}</p>
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
