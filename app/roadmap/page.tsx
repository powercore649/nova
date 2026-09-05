'use client';

import Link from 'next/link';
import { useState } from 'react';

type Status = 'done' | 'in-progress' | 'planned' | 'considering';

interface RoadmapItem {
  title: string;
  description: string;
  status: Status;
  tag: string;
}

const STATUS_META: Record<Status, { label: string; color: string; bg: string; border: string; dot: string }> = {
  'done':        { label: 'Done',        color: '#4ade80', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)',   dot: '#22c55e' },
  'in-progress': { label: 'In Progress', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', dot: '#fbbf24' },
  'planned':     { label: 'Planned',     color: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', dot: '#818cf8' },
  'considering': { label: 'Considering', color: 'var(--text-tertiary)', bg: 'var(--card-bg)', border: 'var(--card-border)', dot: 'var(--text-tertiary)' },
};

const ITEMS: RoadmapItem[] = [
  // Done
  { status: 'done', tag: 'Core', title: 'Project library with search & filters', description: 'Browse, search, and filter projects by tags, language, and type.' },
  { status: 'done', tag: 'Core', title: 'File upload & CDN hosting', description: 'Staff can upload images and ZIPs, served via a dedicated CDN endpoint.' },
  { status: 'done', tag: 'Core', title: 'Staff authentication', description: 'JWT-based login system with protected dashboard routes.' },
  { status: 'done', tag: 'UI', title: 'Custom background image', description: 'Admins can upload a site-wide background image with opacity control.' },
  { status: 'done', tag: 'UI', title: 'Changelog page', description: 'Public changelog tracking every release and update.' },
  { status: 'done', tag: 'UI', title: 'Leaderboard', description: 'Top projects by views and top files by downloads.' },
  { status: 'done', tag: 'Bot', title: 'nova-guard Discord bot page', description: 'Dedicated landing page for the moderation bot with invite link.' },

  // In Progress
  { status: 'in-progress', tag: 'Analytics', title: 'Project view counter', description: 'Real-time view tracking per project, powering the leaderboard.' },
  { status: 'in-progress', tag: 'UI', title: 'Roadmap page', description: "You're looking at it — tracking what's done, in progress, and planned." },

  // Planned
  { status: 'planned', tag: 'Social', title: 'Comments on projects', description: 'Allow visitors to leave feedback and questions directly on project pages.' },
  { status: 'planned', tag: 'Social', title: 'Project ratings', description: 'Thumbs up / star system so the community can surface the best content.' },
  { status: 'planned', tag: 'Core', title: 'Project collections / playlists', description: 'Staff can group related projects into curated collections.' },
  { status: 'planned', tag: 'API', title: 'Public REST API', description: 'Documented endpoints so developers can integrate nova-browser content into their apps.' },
  { status: 'planned', tag: 'UI', title: 'Dark / light theme toggle', description: 'User-controlled theme switching with preference persistence.' },
  { status: 'planned', tag: 'Bot', title: 'nova-guard slash commands', description: 'Live slash command integration for moderation directly from Discord.' },

  // Considering
  { status: 'considering', tag: 'Monetization', title: 'Premium tier', description: 'Optional paid plan for early access to new projects and exclusive content.' },
  { status: 'considering', tag: 'Core', title: 'User accounts for visitors', description: 'Let visitors bookmark projects and follow new releases.' },
  { status: 'considering', tag: 'UI', title: 'Mobile app', description: 'Native iOS / Android companion for the library.' },
];

const ALL_STATUSES: Status[] = ['done', 'in-progress', 'planned', 'considering'];

export default function RoadmapPage() {
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visible = filter === 'all' ? ITEMS : ITEMS.filter(i => i.status === filter);

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = ITEMS.filter(i => i.status === s).length;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <nav className="glass-card-static" style={{
        margin: '1rem', borderRadius: 'var(--radius-full)', padding: '1rem 1.5rem',
        position: 'sticky', top: '1rem', zIndex: 1000, animation: 'slideDown 0.6s ease-out',
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
                color: href === '/roadmap' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: href === '/roadmap' ? 600 : 500, transition: 'color var(--transition-fast)',
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
        }}>🗺️ Public Roadmap</div>
        <h1 style={{ fontSize: 'clamp(2.25rem, 6vw, 3.5rem)', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem' }}>
          What&apos;s <span className="gradient-text">coming next</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
          A transparent look at what we&apos;re building, what&apos;s live, and what&apos;s on our radar.
        </p>

        {/* Summary pills */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          {ALL_STATUSES.map(s => {
            const m = STATUS_META[s];
            return (
              <div key={s} style={{
                padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)',
                background: m.bg, border: `1px solid ${m.border}`,
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.dot }} />
                <span style={{ color: m.color, fontSize: '0.8rem', fontWeight: 600 }}>{m.label}</span>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{counts[s]}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filter tabs + cards */}
      <section className="container" style={{ paddingBottom: '5rem' }}>
        {/* Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('all')}
            className={filter === 'all' ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}>
            All ({ITEMS.length})
          </button>
          {ALL_STATUSES.map(s => {
            const m = STATUS_META[s];
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={filter === s ? 'btn btn-primary' : 'btn btn-ghost'}
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}>
                {m.label} ({counts[s]})
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3">
          {visible.map((item, i) => {
            const m = STATUS_META[item.status];
            return (
              <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span className="badge" style={{ fontSize: '0.65rem' }}>{item.tag}</span>
                  <span style={{
                    padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
                    background: m.bg, border: `1px solid ${m.border}`,
                    color: m.color, fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.dot, display: 'inline-block' }} />
                    {m.label}
                  </span>
                </div>
                {/* Content */}
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, flex: 1 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
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
