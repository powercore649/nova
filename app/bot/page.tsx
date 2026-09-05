'use client';

import Link from 'next/link';
import { useState } from 'react';

const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1521684603897774192';

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'Browse the Library',
    description:
      'Search and preview nova-browser projects and files directly inside Discord — no need to open a browser.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: 'Instant Downloads',
    description:
      'Get direct download links for any project or file without ever leaving your server.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
    title: 'Live Stats',
    description:
      'Check real-time stats — total projects, files, and downloads — with a single command.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Support Tickets',
    description:
      'Open a support ticket straight from Discord and track its status without visiting the website.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: 'Docs on Demand',
    description:
      'Pull up documentation snippets right in your channel so your team stays in flow.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="13 2 13 9 20 9" />
        <path d="M20 14.5V8l-6-6H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7" />
        <path d="m17 21 5-5" />
        <path d="m22 21-5-5" />
      </svg>
    ),
    title: 'New Release Alerts',
    description:
      'Get notified automatically in your server whenever a new project or file is published.',
  },
];

const COMMANDS = [
  { name: '/search <query>', description: 'Search the nova-browser library' },
  { name: '/latest', description: 'Show the 5 most recent projects' },
  { name: '/stats', description: 'Display live library statistics' },
  { name: '/download <id>', description: 'Get the download link for a project or file' },
  { name: '/ticket <message>', description: 'Open a support ticket' },
  { name: '/docs', description: 'Link to the documentation page' },
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
          <Link href="/" style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            fontFamily: 'var(--font-display)',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            nova-browser
          </Link>

          {/* Desktop */}
          <div className="mobile-hidden" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {[
              { href: '/', label: 'Home' },
              { href: '/browse', label: 'Browse' },
              { href: '/docs', label: 'Docs' },
              { href: '/files', label: 'Files' },
              { href: '/support', label: 'Support' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}>
                {label}
              </Link>
            ))}
            <Link href="/bot" style={{ color: 'var(--accent-primary)', fontWeight: 600, transition: 'color var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Bot
            </Link>
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9rem' }}>
              Staff Login
            </Link>
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
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="desktop-hidden" style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            animation: 'slideDown 0.3s ease-out',
          }}>
            {[
              { href: '/', label: 'Home' },
              { href: '/browse', label: 'Browse' },
              { href: '/docs', label: 'Docs' },
              { href: '/files', label: 'Files' },
              { href: '/support', label: 'Support' },
              { href: '/bot', label: 'Bot' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: href === '/bot' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: 500,
                  transition: 'all var(--transition-fast)',
                }}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', textAlign: 'center' }}
            >
              Staff Login
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="container animate-fadeIn" style={{ textAlign: 'center', padding: '5rem 0 3rem' }}>
        {/* Discord blurple glow behind logo */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'rgba(88, 101, 242, 0.15)',
          border: '1px solid rgba(88, 101, 242, 0.35)',
          marginBottom: '1.5rem',
          animation: 'float 4s ease-in-out infinite',
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="#5865F2">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
          </svg>
        </div>

        <div style={{
          display: 'inline-block',
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(88, 101, 242, 0.1)',
          border: '1px solid rgba(88, 101, 242, 0.3)',
          borderRadius: 'var(--radius-full)',
          color: '#818cf8',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}>
          🤖 Discord Bot
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          marginBottom: '1.5rem',
          lineHeight: 1.1,
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
        }}>
          nova-browser,{' '}
          <br />
          <span className="gradient-text">inside Discord.</span>
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          maxWidth: '580px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7,
        }}>
          Browse projects, download files, check live stats and open support tickets — all without leaving your Discord server.
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
              boxShadow: '0 0 20px rgba(88,101,242,0.4)',
              padding: '0.875rem 2rem',
              fontSize: '1rem',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Add to Discord
          </a>
          <Link href="/docs" className="btn btn-secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Documentation
          </Link>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="container" style={{ paddingBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
          }}>
            What the bot can do
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '1rem' }}>
            Everything nova-browser offers, available as slash commands.
          </p>
        </div>

        <div className="grid grid-cols-3">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(88, 101, 242, 0.1)',
                border: '1px solid rgba(88, 101, 242, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                flexShrink: 0,
              }}>
                {feat.icon}
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.4rem',
                  fontFamily: 'var(--font-display)',
                }}>
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

      {/* ── Commands ── */}
      <section className="container" style={{ paddingBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-block',
            marginBottom: '0.75rem',
            padding: '0.4rem 0.9rem',
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--accent-primary)',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            ⚡ Slash Commands
          </div>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
          }}>
            Simple commands,{' '}
            <span className="gradient-text">powerful results</span>
          </h2>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '760px',
          margin: '0 auto',
        }}>
          {COMMANDS.map((cmd) => (
            <div
              key={cmd.name}
              className="glass-card-static"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                flexWrap: 'wrap',
              }}
            >
              <code style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem',
                color: 'var(--accent-primary)',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.3rem 0.75rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {cmd.name}
              </code>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {cmd.description}
              </span>
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
          border: '1px solid rgba(88, 101, 242, 0.2)',
          position: 'relative',
          overflow: 'hidden',
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
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1rem',
            }}>
              Ready to power up{' '}
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #5865F2, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                your server?
              </span>
            </h2>

            <p style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              maxWidth: '480px',
              margin: '0 auto 2rem',
              lineHeight: 1.6,
            }}>
              One click to add nova-browser to your Discord. Free, no sign-up required.
            </p>

            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                background: '#5865F2',
                color: '#fff',
                boxShadow: '0 0 24px rgba(88,101,242,0.45)',
                padding: '0.875rem 2.25rem',
                fontSize: '1rem',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Add to Discord — It&apos;s Free
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}>
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                marginBottom: '1rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                nova-browser
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Premium gateway to legendary source code.
              </p>
            </div>
            <div>
              <h4 style={{
                fontSize: '0.875rem',
                marginBottom: '1rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Quick Links
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { href: '/browse', label: 'Browse' },
                  { href: '/docs', label: 'Documentation' },
                  { href: '/files', label: 'Files' },
                  { href: '/support', label: 'Support' },
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
            paddingTop: '2rem',
            borderTop: '1px solid var(--card-border)',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '0.875rem',
          }}>
            © {new Date().getFullYear()} nova-browser. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
