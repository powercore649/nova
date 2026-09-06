'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeProvider';
import NotificationBell from '@/components/NotificationBell';

interface Account {
  accountId: string;
  username: string;
}

const LINKS = [
  { href: '/',             label: 'Home' },
  { href: '/browse',       label: 'Browse' },
  { href: '/docs',         label: 'Docs' },
  { href: '/files',        label: 'Files' },
  { href: '/upload',       label: 'Upload' },
  { href: '/collections',  label: 'Collections' },
  { href: '/bookmarks',    label: 'Bookmarks' },
  { href: '/leaderboard',  label: 'Leaderboard' },
  { href: '/roadmap',      label: 'Roadmap' },
  { href: '/changelogs',   label: 'Changelog' },
  { href: '/support',      label: 'Support' },
  { href: '/bot',          label: 'Bot' },
];

// Split into two groups for desktop to avoid overflow
const PRIMARY_LINKS   = LINKS.slice(0, 6);   // Home → Collections
const SECONDARY_LINKS = LINKS.slice(6);       // Leaderboard → Bot

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);

  // Fetch current session
  useEffect(() => {
    fetch('/api/account/me')
      .then(r => r.json())
      .then(d => { setAccount(d.account ?? null); setAccountLoading(false); })
      .catch(() => setAccountLoading(false));
  }, [pathname]); // re-check on route change

  async function handleLogout() {
    await fetch('/api/account/logout', { method: 'POST' });
    setAccount(null);
    router.push('/');
    router.refresh();
  }

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ── Sticky pill nav ─────────────────────────────────────── */}
      <nav
        className="glass-card-static"
        style={{
          margin: '1rem',
          borderRadius: 'var(--radius-full)',
          padding: '0.75rem 1.25rem',
          position: 'sticky',
          top: '1rem',
          zIndex: 200,
          animation: 'slideDown 0.5s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

          {/* Logo */}
          <Link
            href="/"
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              flexShrink: 0,
              letterSpacing: '-0.03em',
            }}
          >
            nova-browser
          </Link>

          {/* Desktop links */}
          <div
            className="mobile-hidden"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: '0.35rem 0.7rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    background: active ? 'rgba(34,197,94,0.1)' : 'transparent',
                    border: active ? '1px solid rgba(34,197,94,0.25)' : '1px solid transparent',
                    transition: 'all var(--transition-fast)',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--card-bg)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Desktop right actions */}
          <div className="mobile-hidden" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
            <NotificationBell />
            <ThemeToggle />
            {!accountLoading && (
              account ? (
                /* Logged-in: avatar + username dropdown trigger */
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Link
                    href={`/profile/${encodeURIComponent(account.username)}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.35rem 0.75rem 0.35rem 0.35rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {/* Mini avatar */}
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: 'var(--accent-gradient)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 800, color: '#05130a',
                      flexShrink: 0,
                    }}>
                      {account.username.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {account.username}
                    </span>
                  </Link>
                  <button onClick={handleLogout} title="Sign out"
                    style={{ padding: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </button>
                </div>
              ) : (
                /* Not logged in */
                <Link href="/signin" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                  Sign In
                </Link>
              )
            )}
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
              Staff
            </Link>
          </div>

          {/* Mobile right: theme toggle + hamburger */}
          <div className="desktop-hidden" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <NotificationBell />
            <ThemeToggle />
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: 0,
                transition: 'all var(--transition-fast)',
              }}
            >
              <span style={{ display: 'block', width: '18px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px', transition: 'all 0.3s' }} />
              <span style={{ display: 'block', width: '14px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px', alignSelf: 'flex-start', marginLeft: '2px', transition: 'all 0.3s' }} />
              <span style={{ display: 'block', width: '18px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px', transition: 'all 0.3s' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile sidebar overlay ───────────────────────────────── */}
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sidebar panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '280px',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--card-border)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 999,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Sidebar header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: '1px solid var(--card-border)',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-secondary)',
          zIndex: 1,
        }}>
          <Link
            href="/"
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            nova-browser
          </Link>

          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Links */}
        <nav style={{ padding: '0.75rem 0.75rem', flex: 1 }}>
          <p style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-tertiary)',
            padding: '0.25rem 0.75rem',
            marginBottom: '0.25rem',
          }}>
            Navigation
          </p>

          {LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.95rem',
                  background: active ? 'rgba(34,197,94,0.08)' : 'transparent',
                  borderLeft: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  marginBottom: '0.1rem',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {/* Active dot */}
                {active && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    flexShrink: 0,
                    boxShadow: '0 0 6px rgba(34,197,94,0.6)',
                  }}/>
                )}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--card-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
        }}>
          {!accountLoading && (
            account ? (
              <>
                <Link href={`/profile/${encodeURIComponent(account.username)}`}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#05130a' }}>
                    {account.username.charAt(0).toUpperCase()}
                  </div>
                  {account.username}
                </Link>
                <button onClick={handleLogout}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.82rem', color: '#f87171' }}>
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/signin" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Sign In
              </Link>
            )
          )}
          <Link href="/login" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.78rem' }}>
            Staff portal
          </Link>
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-tertiary)', margin: 0 }}>
            © {new Date().getFullYear()} nova-browser
          </p>
        </div>
      </div>
    </>
  );
}
