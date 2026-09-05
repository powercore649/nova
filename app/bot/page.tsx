'use client';

import Link from 'next/link';
import { useState } from 'react';

const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1521684603897774192';

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Auto Moderation',
    description:
      'Automatically detect and remove spam, slurs, mass mentions, invite links, and toxic content before it reaches your members.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: 'Warnings & Infractions',
    description:
      'Issue warnings, track infraction history per user, and set thresholds that automatically escalate to mutes or bans.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Mute / Ban / Kick',
    description:
      'Full punishment suite — temporary mutes, timed bans, soft bans, and kicks, all with reason logging and DM notifications.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Detailed Logs',
    description:
      'Every action — message edits, deletions, joins, leaves, role changes — logged to a dedicated channel with timestamps.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Role Management',
    description:
      'Auto-assign roles on join, self-assignable roles, reaction roles, and timed role removal — all in one place.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Anti-Raid Protection',
    description:
      'Detect and neutralize raids in real time — mass-join lockdowns, verification gates, and instant alert pings to your staff.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    ),
    title: 'Custom Commands',
    description:
      'Build your own slash commands with custom responses, embeds, and permission levels — no coding required.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'Dashboard',
    description:
      'Manage every setting from a clean web dashboard — no need to memorise commands. Changes apply instantly.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
    title: 'Stats & Insights',
    description:
      'Track member growth, message activity, and moderation trends over time with built-in server analytics.',
  },
];

export default function BotPage() {
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
          {/* Bot branding — links back to home */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(88,101,242,0.15)',
              border: '1px solid rgba(88,101,242,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: '#818cf8',
            }}>
              nova-guard
            </span>
          </div>

          {/* Desktop links */}
          <div className="mobile-hidden" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#features" style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}>Features</a>
            <Link href="/support" style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}>Support</Link>
            <Link href="/" style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}>nova-browser</Link>
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ background: '#5865F2', color: '#fff', padding: '0.625rem 1.25rem', fontSize: '0.9rem' }}
            >
              Add to Discord
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="desktop-hidden btn-icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={{ padding: '0.5rem' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
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
              { href: '#features', label: 'Features' },
              { href: '/support', label: 'Support' },
              { href: '/', label: 'nova-browser', external: false },
            ].map(({ href, label }) => (
              <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} style={{
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)', fontWeight: 500,
                transition: 'all var(--transition-fast)',
              }}>
                {label}
              </a>
            ))}
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ background: '#5865F2', color: '#fff', padding: '0.75rem 1rem', fontSize: '0.9rem', textAlign: 'center' }}
            >
              Add to Discord
            </a>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="container animate-fadeIn" style={{ textAlign: 'center', padding: '5rem 0 4rem' }}>
        {/* Animated Discord logo */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '96px', height: '96px', borderRadius: '50%',
          background: 'rgba(88,101,242,0.15)',
          border: '1px solid rgba(88,101,242,0.35)',
          marginBottom: '1.75rem',
          animation: 'float 4s ease-in-out infinite',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#5865F2">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
          </svg>
        </div>

        <div style={{
          display: 'inline-block', marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(88,101,242,0.1)',
          border: '1px solid rgba(88,101,242,0.3)',
          borderRadius: 'var(--radius-full)',
          color: '#818cf8', fontSize: '0.875rem', fontWeight: 600,
        }}>
          🛡️ All-in-One Moderation Bot
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          marginBottom: '1.5rem',
          lineHeight: 1.1,
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
        }}>
          Keep your server{' '}
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #5865F2, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            safe & clean.
          </span>
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          maxWidth: '580px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7,
        }}>
          nova-guard is a powerful Discord moderation bot — auto-mod, warnings, bans, logs, anti-raid, role management and more. Everything you need in one bot.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              background: '#5865F2',
              color: '#fff',
              boxShadow: '0 0 24px rgba(88,101,242,0.4)',
              padding: '0.875rem 2rem',
              fontSize: '1rem',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Add to Discord
          </a>
          <a href="#features" className="btn btn-secondary">
            See Features
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </a>
        </div>

        {/* Quick badges */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.5rem' }}>
          {['Free to use', 'No sign-up', '99.9% uptime', 'Easy setup'].map((badge) => (
            <span key={badge} className="badge" style={{ fontSize: '0.8rem' }}>
              ✓ {badge}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="container" style={{ paddingBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-block', marginBottom: '0.75rem',
            padding: '0.4rem 0.9rem',
            background: 'rgba(88,101,242,0.08)',
            border: '1px solid rgba(88,101,242,0.25)',
            borderRadius: 'var(--radius-full)',
            color: '#818cf8', fontSize: '0.8rem', fontWeight: 600,
          }}>
            ⚡ Features
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Everything your server needs,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #5865F2, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              nothing extra.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-3">
          {FEATURES.map((feat) => (
            <div key={feat.title} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                width: '52px', height: '52px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(88,101,242,0.1)',
                border: '1px solid rgba(88,101,242,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#818cf8', flexShrink: 0,
              }}>
                {feat.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
                  {feat.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container" style={{ paddingBottom: '5rem' }}>
        <div className="glass-card-static" style={{
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(2.5rem, 6vw, 4rem) 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(88,101,242,0.08) 0%, rgba(88,101,242,0.03) 100%)',
          border: '1px solid rgba(88,101,242,0.2)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '240px', height: '240px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(88,101,242,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-60px', left: '-60px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(88,101,242,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              lineHeight: 1.15, marginBottom: '1rem',
            }}>
              Ready to protect{' '}
              <span style={{
                background: 'linear-gradient(135deg, #5865F2, #818cf8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                your server?
              </span>
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.6,
            }}>
              Add nova-guard in one click. Free, no account needed, up and running in seconds.
            </p>
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                background: '#5865F2', color: '#fff',
                boxShadow: '0 0 24px rgba(88,101,242,0.45)',
                padding: '0.875rem 2.25rem', fontSize: '1rem',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Add nova-guard — It&apos;s Free
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container">
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '1rem',
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              © {new Date().getFullYear()} nova-guard. All rights reserved.
            </span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Features</a>
              <Link href="/support" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Support</Link>
              <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>nova-browser</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
