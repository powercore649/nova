'use client';

import Link from 'next/link';
import { useState } from 'react';

const CHANGELOGS = [
  {
    version: '1.3.0',
    date: 'September 5, 2026',
    tag: 'latest',
    changes: [
      { type: 'new', text: 'Staff can now upload a custom background image from the dashboard' },
      { type: 'new', text: 'Background opacity control with live preview' },
      { type: 'new', text: 'Stats section on home page now shows real data from the database' },
      { type: 'new', text: 'Features section added to the home page' },
      { type: 'new', text: 'CTA banner added above the footer' },
      { type: 'new', text: 'Discord bot page (/bot) — nova-guard moderation bot' },
      { type: 'new', text: 'Changelog page (/changelogs)' },
      { type: 'new', text: 'Custom 404, 500 and global error pages' },
      { type: 'new', text: 'Custom favicon and site icon' },
      { type: 'fix', text: 'Background upload now works correctly for all users' },
      { type: 'fix', text: 'Site title updated to nova-browser' },
    ],
  },
  {
    version: '1.2.0',
    date: 'August 2026',
    tag: null,
    changes: [
      { type: 'new', text: 'CDN asset hosting and management dashboard' },
      { type: 'new', text: 'File upload system with ZIP and image support' },
      { type: 'new', text: 'Download counter per file with real-time tracking' },
      { type: 'new', text: 'Support ticket system (/support)' },
      { type: 'new', text: 'Staff-only dashboard with project management table' },
      { type: 'improved', text: 'Project cards now show tags and direct download button' },
    ],
  },
  {
    version: '1.1.0',
    date: 'July 2026',
    tag: null,
    changes: [
      { type: 'new', text: 'YouTube tutorial embed in project detail modal' },
      { type: 'new', text: 'Browse page with search and tag filtering' },
      { type: 'new', text: 'Documentation page (/docs)' },
      { type: 'new', text: 'Files page listing all uploaded assets' },
      { type: 'improved', text: 'Mobile-responsive navbar with hamburger menu' },
      { type: 'improved', text: 'Skeleton loaders on project grid while fetching' },
      { type: 'fix', text: 'Project modal closes correctly on overlay click' },
    ],
  },
  {
    version: '1.0.0',
    date: 'June 2026',
    tag: 'initial',
    changes: [
      { type: 'new', text: 'Initial release of nova-browser' },
      { type: 'new', text: 'Home page with hero section and latest projects grid' },
      { type: 'new', text: 'Project detail modal with description and download link' },
      { type: 'new', text: 'Staff authentication with JWT cookies' },
      { type: 'new', text: 'MongoDB integration for projects and files' },
      { type: 'new', text: 'Terminal dark design system with green accent' },
    ],
  },
];

const TAG_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  new:      { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  color: 'var(--accent-primary)' },
  fix:      { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', color: '#fbbf24' },
  improved: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', color: '#818cf8' },
  removed:  { bg: 'rgba(248,113,113,0.08)',border: 'rgba(248,113,113,0.25)',color: '#f87171' },
};

const TYPE_LABELS: Record<string, string> = {
  new: '+ new',
  fix: '~ fix',
  improved: '↑ improved',
  removed: '- removed',
};

export default function ChangelogsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ── */}
      <nav className="glass-card-static" style={{
        margin: '1rem',
        borderRadius: 'var(--radius-full)',
        padding: '1rem 1.5rem',
        position: 'sticky',
        top: '1rem',
        zIndex: 1000,
        animation: 'slideDown 0.6s ease-out',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{
            fontSize: '1.5rem', fontWeight: 'bold',
            fontFamily: 'var(--font-display)',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            nova-browser
          </Link>

          <div className="mobile-hidden" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {[
              { href: '/', label: 'Home' },
              { href: '/browse', label: 'Browse' },
              { href: '/docs', label: 'Docs' },
              { href: '/files', label: 'Files' },
              { href: '/support', label: 'Support' },
              { href: '/changelogs', label: 'Changelog' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                color: href === '/changelogs' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: href === '/changelogs' ? 600 : 500,
                transition: 'color var(--transition-fast)',
              }}>
                {label}
              </Link>
            ))}
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9rem' }}>
              Staff Login
            </Link>
          </div>

          <button
            className="desktop-hidden btn-icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={{ padding: '0.5rem' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="desktop-hidden" style={{
            marginTop: '1rem', paddingTop: '1rem',
            borderTop: '1px solid var(--card-border)',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            animation: 'slideDown 0.3s ease-out',
          }}>
            {[
              { href: '/', label: 'Home' },
              { href: '/browse', label: 'Browse' },
              { href: '/docs', label: 'Docs' },
              { href: '/files', label: 'Files' },
              { href: '/support', label: 'Support' },
              { href: '/changelogs', label: 'Changelog' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} style={{
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)', fontWeight: 500,
                transition: 'all var(--transition-fast)',
              }}>
                {label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary"
              style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', textAlign: 'center' }}>
              Staff Login
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="container animate-fadeIn" style={{ padding: '4rem 0 3rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600,
        }}>
          📋 Release History
        </div>
        <h1 style={{
          fontSize: 'clamp(2.25rem, 6vw, 3.5rem)',
          fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem',
        }}>
          What&apos;s new in{' '}
          <span className="gradient-text">nova-browser</span>
        </h1>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '1.05rem',
          maxWidth: '520px', margin: '0 auto', lineHeight: 1.7,
        }}>
          Every update, fix, and improvement — documented and dated.
        </p>
      </section>

      {/* ── Timeline ── */}
      <section className="container" style={{ paddingBottom: '5rem', maxWidth: '820px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {CHANGELOGS.map((release, i) => (
            <div key={release.version} className="animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
              {/* Version header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '1.25rem', flexWrap: 'wrap',
              }}>
                <div style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: i === 0 ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  flexShrink: 0,
                  boxShadow: i === 0 ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
                }} />
                <h2 style={{
                  fontSize: '1.4rem', fontFamily: 'var(--font-display)',
                  fontWeight: 800, color: 'var(--text-primary)',
                }}>
                  v{release.version}
                </h2>
                {release.tag && (
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                    {release.tag}
                  </span>
                )}
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginLeft: 'auto' }}>
                  {release.date}
                </span>
              </div>

              {/* Changes list */}
              <div className="glass-card-static" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {release.changes.map((change, j) => {
                    const style = TAG_COLORS[change.type] ?? TAG_COLORS.new;
                    return (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{
                          flexShrink: 0,
                          fontSize: '0.7rem', fontWeight: 700,
                          fontFamily: 'var(--font-display)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          color: style.color,
                          whiteSpace: 'nowrap',
                          marginTop: '1px',
                        }}>
                          {TYPE_LABELS[change.type] ?? change.type}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                          {change.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Connector line (not on last) */}
              {i < CHANGELOGS.length - 1 && (
                <div style={{
                  width: '1px',
                  height: '1.5rem',
                  background: 'var(--card-border)',
                  marginLeft: '5px',
                  marginTop: '0.5rem',
                }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem', marginBottom: '2rem',
          }}>
            <div>
              <h3 style={{
                fontSize: '1.25rem', marginBottom: '1rem',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                nova-browser
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Premium gateway to legendary source code.
              </p>
            </div>
            <div>
              <h4 style={{
                fontSize: '0.875rem', marginBottom: '1rem',
                color: 'var(--text-primary)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Quick Links
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { href: '/browse', label: 'Browse' },
                  { href: '/docs', label: 'Documentation' },
                  { href: '/files', label: 'Files' },
                  { href: '/support', label: 'Support' },
                  { href: '/changelogs', label: 'Changelog' },
                  { href: '/bot', label: 'Discord Bot' },
                  { href: '/login', label: 'Staff Login' },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div style={{
            paddingTop: '2rem', borderTop: '1px solid var(--card-border)',
            textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem',
          }}>
            © {new Date().getFullYear()} nova-browser. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
