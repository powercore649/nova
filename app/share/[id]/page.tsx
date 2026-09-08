'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://novacorpbumpify.dpdns.org';

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrSrc, setQrSrc] = useState('');
  const { success, error } = useToast();

  const url = `${SITE_URL}/project/${id}`;

  useEffect(() => {
    fetch(`/api/snippets/${id}`)
      .then(r => r.json())
      .then(d => { setProject(d.project); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  // Generate QR using a free API
  useEffect(() => {
    if (!url) return;
    setQrSrc(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=080c09&color=22c55e&format=png&margin=12`);
  }, [url]);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      success(`${label} copied!`);
    } catch {
      error('Copy failed');
    }
  }

  const SHARE_LINKS = project ? [
    {
      label: 'Twitter / X',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${project.title}" on nova-browser`)}&url=${encodeURIComponent(url)}`,
      color: '#1da1f2',
    },
    {
      label: 'Discord',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
        </svg>
      ),
      href: url,
      color: '#5865f2',
      copyOnly: true,
    },
    {
      label: 'Reddit',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      ),
      href: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(project.title)}`,
      color: '#ff4500',
    },
  ] : [];

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section className="container animate-fadeIn" style={{ padding: '3.5rem 0 5rem', maxWidth: '720px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
          {project && <Link href={`/project/${id}`} style={{ color: 'var(--text-tertiary)' }}>← Back to project</Link>}
        </div>

        <div style={{ display: 'inline-block', marginBottom: '1rem', padding: '0.35rem 0.9rem', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-full)', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 600 }}>
          🔗 Share
        </div>

        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          {loading ? 'Loading…' : project?.title || 'Project'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Share this project with your friends, community, or on social media.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* QR Code */}
          <div className="glass-card-static" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', borderRadius: 'var(--radius-lg)' }}>
            {qrSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrSrc} alt="QR Code" width={160} height={160} style={{ borderRadius: 'var(--radius-md)', display: 'block' }} />
            ) : (
              <div className="skeleton" style={{ width: '160px', height: '160px', borderRadius: 'var(--radius-md)' }} />
            )}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Scan to open</span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Direct link */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.4rem' }}>
                Direct link
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1, padding: '0.6rem 0.875rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                  {url}
                </div>
                <button onClick={() => copy(url, 'Link')} className="btn btn-primary" style={{ flexShrink: 0, padding: '0 1rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            {/* Markdown */}
            {project && (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.4rem' }}>
                  Markdown
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, padding: '0.6rem 0.875rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                    {`[${project.title}](${url})`}
                  </div>
                  <button onClick={() => copy(`[${project.title}](${url})`, 'Markdown')} className="btn btn-secondary" style={{ flexShrink: 0, padding: '0 1rem' }}>
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Social share */}
            {SHARE_LINKS.length > 0 && (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.4rem' }}>
                  Share on
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {SHARE_LINKS.map(s => (
                    s.copyOnly ? (
                      <button key={s.label} onClick={() => copy(url, `${s.label} link`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: s.color, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                        {s.icon} {s.label}
                      </button>
                    ) : (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: s.color, fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none' }}>
                        {s.icon} {s.label}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          © {new Date().getFullYear()} nova-browser
        </div>
      </footer>
    </main>
  );
}
