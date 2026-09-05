'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Collection {
  _id: string;
  name: string;
  description: string;
  username: string;
  projectIds: string[];
  createdAt: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [author, setAuthor] = useState('');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/collections')
      .then(r => r.json())
      .then(d => { setCollections(d.collections || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function createCollection() {
    if (!name.trim()) return;
    setCreating(true);
    setMsg('');
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: desc.trim(), username: author.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCollections(prev => [data.collection, ...prev]);
      setName(''); setDesc(''); setAuthor('');
      setShowForm(false);
      setMsg('✓ Collection created!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(`✗ ${e.message || 'Failed'}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav className="glass-card-static" style={{ margin: '1rem', borderRadius: 'var(--radius-full)', padding: '1rem 1.5rem', position: 'sticky', top: '1rem', zIndex: 1000, animation: 'slideDown 0.6s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            nova-browser
          </Link>
          <div className="mobile-hidden" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {[['/', 'Home'], ['/browse', 'Browse'], ['/collections', 'Collections'], ['/leaderboard', 'Leaderboard'], ['/roadmap', 'Roadmap'], ['/support', 'Support']].map(([href, label]) => (
              <Link key={href} href={href} style={{ color: href === '/collections' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: href === '/collections' ? 600 : 500, transition: 'color var(--transition-fast)' }}>{label}</Link>
            ))}
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9rem' }}>Staff Login</Link>
          </div>
          <button className="desktop-hidden btn-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="desktop-hidden" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'slideDown 0.3s ease-out' }}>
            {[['/', 'Home'], ['/browse', 'Browse'], ['/collections', 'Collections'], ['/leaderboard', 'Leaderboard'], ['/roadmap', 'Roadmap'], ['/support', 'Support']].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</Link>
            ))}
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Staff Login</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="container animate-fadeIn" style={{ padding: '3.5rem 0 2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', marginBottom: '1rem', padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-full)', color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600 }}>
          📚 Collections
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.75rem' }}>
          Curated <span className="gradient-text">project lists</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
          Group and share your favourite projects. Anyone can create a collection.
        </p>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {showForm ? 'Cancel' : 'New Collection'}
        </button>
        {msg && <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: msg.startsWith('✓') ? 'var(--accent-primary)' : '#f87171' }}>{msg}</p>}
      </section>

      {/* Create form */}
      {showForm && (
        <section className="container animate-slideUp" style={{ paddingBottom: '2rem', maxWidth: '540px' }}>
          <div className="glass-card-static" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)', margin: 0 }}>Create collection</h3>
            <input placeholder="Name *" value={name} onChange={e => setName(e.target.value)} maxLength={100}
              style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.95rem' }}/>
            <textarea placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} maxLength={500} rows={3}
              style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit' }}/>
            <input placeholder="Your name (optional)" value={author} onChange={e => setAuthor(e.target.value)} maxLength={32}
              style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.95rem' }}/>
            <button onClick={createCollection} disabled={creating || !name.trim()} className="btn btn-primary" style={{ opacity: !name.trim() ? 0.5 : 1 }}>
              {creating ? 'Creating…' : 'Create Collection'}
            </button>
          </div>
        </section>
      )}

      {/* List */}
      <section className="container" style={{ paddingBottom: '5rem' }}>
        {loading ? (
          <div className="grid grid-cols-3">
            {[1,2,3].map(i => <div key={i} className="glass-card-static skeleton" style={{ height: '120px' }}/>)}
          </div>
        ) : collections.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No collections yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Be the first to create one!</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">Create Collection</button>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {collections.map(col => (
              <Link key={col._id} href={`/collections/${col._id}`} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textDecoration: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>{col.name}</h3>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem', flexShrink: 0 }}>{col.projectIds.length} project{col.projectIds.length !== 1 ? 's' : ''}</span>
                </div>
                {col.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{col.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>by {col.username}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {new Date(col.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          © {new Date().getFullYear()} nova-browser — <Link href="/" style={{ color: 'var(--text-tertiary)' }}>Home</Link>
        </div>
      </footer>
    </main>
  );
}
