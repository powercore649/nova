'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';

interface Repo {
  _id: string;
  name: string;
  description: string;
  ownerName: string;
  visibility: 'public' | 'private';
  stars: number;
  createdAt: string;
  updatedAt: string;
}

function timeAgo(date: string) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function ReposPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  // Create form
  const [form, setForm] = useState({ name: '', description: '', visibility: 'public', ownerName: '', readme: '' });
  const [creating, setCreating] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const q = search.trim() ? `?q=${encodeURIComponent(search)}` : '';
    fetch(`/api/repos${q}`)
      .then(r => r.json())
      .then(d => { setRepos(d.repos || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search]);

  async function createRepo() {
    if (!form.name.trim()) { error('Name is required'); return; }
    setCreating(true);
    try {
      const res = await fetch('/api/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          readme: form.readme || `# ${form.name}\n\n${form.description || 'A nova-browser repository.'}\n`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      success('Repository created!');
      setRepos(prev => [data.repo, ...prev]);
      setShowCreate(false);
      setForm({ name: '', description: '', visibility: 'public', ownerName: '', readme: '' });
    } catch (e: any) {
      error(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section className="container animate-fadeIn" style={{ padding: '3rem 0 5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.8rem', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-full)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              Repositories
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.4rem' }}>
              Explore Repos
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {repos.length} public {repos.length === 1 ? 'repository' : 'repositories'}
            </p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Repository
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="glass-card-static animate-slideUp" style={{ marginBottom: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent-border)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '1.25rem' }}>Create a new repository</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Owner name *
                </label>
                <input value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
                  placeholder="yourname" maxLength={32}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Repository name *
                </label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="my-awesome-project" maxLength={100}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>Letters, numbers, hyphens, underscores, dots only</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Description
                </label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What is this repo about?" maxLength={500}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
              </div>
              {/* Visibility */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Visibility
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['public', 'private'] as const).map(v => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, visibility: v }))}
                      style={{
                        flex: 1, padding: '0.55rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        border: `1px solid ${form.visibility === v ? 'var(--accent-border)' : 'var(--card-border)'}`,
                        background: form.visibility === v ? 'var(--accent-dim)' : 'var(--card-bg)',
                        color: form.visibility === v ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        fontFamily: 'var(--font-sans)',
                      }}>
                      {v === 'public' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      )}
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={createRepo} disabled={creating || !form.name.trim() || !form.ownerName.trim()} className="btn btn-primary" style={{ opacity: !form.name.trim() || !form.ownerName.trim() ? 0.5 : 1 }}>
                {creating ? 'Creating…' : 'Create Repository'}
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search repositories…"
            style={{ width: '100%', paddingLeft: '2.5rem', padding: '0.75rem 0.875rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : repos.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>No repositories yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Be the first to create one.</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">Create Repository</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {repos.map(repo => (
              <Link key={repo._id} href={`/repos/${repo._id}`}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textDecoration: 'none' }}>
                <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem 1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                      <span style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
                        {repo.ownerName}
                      </span>
                      <span style={{ color: 'var(--text-tertiary)' }}>/</span>
                      <span style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        {repo.name}
                      </span>
                      <span className="badge" style={{ fontSize: '0.62rem', marginLeft: '0.1rem' }}>
                        {repo.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
                      </span>
                    </div>
                    {repo.description && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                        {repo.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Updated {timeAgo(repo.updatedAt)}
                      </span>
                      {repo.stars > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          ⭐ {repo.stars}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '0.2rem' }}>
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          © {new Date().getFullYear()} nova-browser
        </div>
      </footer>
    </main>
  );
}
