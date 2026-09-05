'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Project {
  _id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  views: number;
  createdAt: string;
}

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/collections/${id}`)
      .then(r => r.json())
      .then(async d => {
        if (!d.collection) { setNotFound(true); setLoading(false); return; }
        setCollection(d.collection);
        // Fetch all snippets and filter to this collection's projectIds
        if (d.collection.projectIds.length > 0) {
          const snippets = await fetch('/api/snippets').then(r => r.json()).catch(() => ({ snippets: [] }));
          const ids = new Set(d.collection.projectIds);
          setProjects((snippets.snippets || []).filter((s: Project) => ids.has(s._id)));
        }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '60px', borderRadius: 'var(--radius-md)' }}/>)}
      </div>
    </main>
  );

  if (notFound) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>Collection not found</h1>
        <Link href="/collections" className="btn btn-primary">View all collections</Link>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ borderBottom: '1px solid var(--card-border)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <Link href="/collections" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>← Collections</Link>
        <span style={{ color: 'var(--card-border)' }}>|</span>
        <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Home</Link>
      </div>

      <section className="container animate-fadeIn" style={{ padding: '3rem 0 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontFamily: 'var(--font-display)', fontWeight: 800, margin: 0 }}>
              {collection.name}
            </h1>
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
              {collection.projectIds.length} project{collection.projectIds.length !== 1 ? 's' : ''}
            </span>
          </div>
          {collection.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '620px', marginBottom: '0.5rem' }}>
              {collection.description}
            </p>
          )}
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            Created by <strong style={{ color: 'var(--text-secondary)' }}>{collection.username}</strong>
            {' · '}
            {new Date(collection.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No projects yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Open a project page and use the Save button to add it here.
            </p>
            <Link href="/browse" className="btn btn-primary">Browse Library</Link>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {projects.map(p => (
              <div key={p._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{p.language || 'project'}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>{p.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                {p.tags && p.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {p.tags.slice(0, 3).map(t => <span key={t} className="badge" style={{ fontSize: '0.65rem' }}>{t}</span>)}
                  </div>
                )}
                <Link href={`/project/${p._id}`} className="btn btn-ghost" style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', justifyContent: 'center' }}>
                  View Project →
                </Link>
              </div>
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
