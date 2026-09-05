'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import DetailModal, { DetailItem } from '@/components/DetailModal';

interface LatestItem {
  _id: string;
  kind: 'project' | 'file';
  createdAt: string;
  // project fields
  title?: string;
  description?: string;
  tags?: string[];
  downloadUrl?: string;
  // file fields
  originalName?: string;
  fileType?: 'image' | 'zip';
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  // shared
  youtubeUrl?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Stats {
  projects: number;
  files: number;
  downloads: number;
}

export default function Home() {
  const [items, setItems] = useState<LatestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detail, setDetail] = useState<LatestItem | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then((data: Stats) => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/snippets').then(res => res.json()).catch(() => ({ snippets: [] })),
      fetch('/api/files').then(res => res.json()).catch(() => ({ files: [] })),
    ])
      .then(([snippetData, fileData]) => {
        const projects: LatestItem[] = (snippetData.snippets || []).map((s: any) => ({
          ...s,
          kind: 'project' as const,
        }));
        const files: LatestItem[] = (fileData.files || []).map((f: any) => ({
          ...f,
          kind: 'file' as const,
        }));
        const merged = [...projects, ...files].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setItems(merged.slice(0, 6));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch latest items:', err);
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Modern Navbar */}
      <nav className="glass-card-static" style={{
        margin: '1rem',
        borderRadius: 'var(--radius-full)',
        padding: '1rem 1.5rem',
        position: 'sticky',
        top: '1rem',
        zIndex: 1000,
        animation: 'slideDown 0.6s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            fontFamily: 'var(--font-display)',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            nova-browser
          </Link>

          {/* Desktop Menu */}
          <div className="mobile-hidden" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/" style={{ color: 'var(--text-primary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}>
              Home
            </Link>
            <Link href="/browse" style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}>
              Browse
            </Link>
            <Link href="/docs" style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}>
              Docs
            </Link>
            <Link href="/files" style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}>
              Files
            </Link>
            <Link href="/support" style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}>
              Support
            </Link>
            <Link href="/bot" style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {/* Discord icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Bot
            </Link>
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9rem' }}>
              Staff Login
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="desktop-hidden btn-icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={{ padding: '0.5rem' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="desktop-hidden" style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontWeight: 500,
                background: 'var(--card-bg)',
                transition: 'all var(--transition-fast)'
              }}
            >
              Home
            </Link>
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                transition: 'all var(--transition-fast)'
              }}
            >
              Browse
            </Link>
            <Link
              href="/docs"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                transition: 'all var(--transition-fast)'
              }}
            >
              Docs
            </Link>
            <Link
              href="/files"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                transition: 'all var(--transition-fast)'
              }}
            >
              Files
            </Link>
            <Link
              href="/support"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                transition: 'all var(--transition-fast)'
              }}
            >
              Support
            </Link>
            <Link
              href="/bot"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Bot
            </Link>
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

      {/* Hero Section */}
      <section className="container animate-fadeIn" style={{
        textAlign: 'center',
        padding: '4rem 0 3rem',
        flex: 1
      }}>
        <div style={{
          display: 'inline-block',
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--accent-primary)',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          ✨ Premium Code Library
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          marginBottom: '1.5rem',
          lineHeight: 1.1,
          fontFamily: 'var(--font-display)',
          fontWeight: 800
        }}>
          nova-browser Dev <br />
          <span className="gradient-text">average coders.</span>
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          maxWidth: '600px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          Your premium gateway to legendary source code.
          Search, explore and just pure value.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link href="/browse" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            Browse Library
          </Link>
          <Link href="/docs" className="btn btn-secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            Documentation
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container animate-fadeIn" style={{ paddingBottom: '4rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
        }}>
          {[
            { value: stats ? `${stats.projects}` : '—', label: 'Projects', icon: '📦' },
            { value: stats ? `${stats.files}` : '—', label: 'Files & Assets', icon: '🗂️' },
            { value: stats ? `${stats.downloads}` : '—', label: 'Downloads', icon: '⬇️' },
            { value: '24/7', label: 'Availability', icon: '🟢' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card-static"
              style={{
                padding: '2rem 1.5rem',
                textAlign: 'center',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.1,
                marginBottom: '0.4rem',
              }}>
                {stat.value === '—'
                  ? <span className="skeleton" style={{ display: 'inline-block', width: '60px', height: '2.25rem', verticalAlign: 'middle' }} />
                  : stat.value}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
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
            ⚡ Why nova-browser
          </div>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            lineHeight: 1.2,
          }}>
            Everything you need,{' '}
            <span className="gradient-text">nothing you don&apos;t</span>
          </h2>
        </div>

        <div className="grid grid-cols-3">
          {[
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              ),
              title: 'Instant Search',
              description: 'Find exactly what you need in seconds. Filter by tags, type, and date across the entire library.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              ),
              title: 'One-Click Download',
              description: 'Grab source code, ZIPs, or raw files instantly. No sign-up required for the public library.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              ),
              title: 'Video Tutorials',
              description: 'Many projects come with an embedded YouTube walkthrough so you understand the code, not just copy it.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              ),
              title: 'Full Documentation',
              description: 'Clear API docs and usage guides maintained by the nova-browser team to get you productive fast.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              ),
              title: 'CDN Assets',
              description: 'Access hosted assets directly via our CDN endpoint — perfect for prototypes and live demos.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              ),
              title: 'Dedicated Support',
              description: 'Open a ticket anytime. The staff team reviews every request and responds as quickly as possible.',
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
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
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                }}>
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Grid Section */}
      <section className="container" style={{ paddingBottom: '4rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700
          }}>
            Latest Projects
          </h2>
          <Link href="/browse" className="btn btn-ghost">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-lg)' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card-static" style={{ padding: '1.5rem' }}>
                <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '1rem' }}></div>
                <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '0.5rem' }}></div>
                <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '1rem' }}></div>
                <div className="skeleton" style={{ height: '36px', width: '120px' }}></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card" style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--card-bg)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              No Projects Yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Staff, please login to upload your first project.
            </p>
            <Link href="/login" className="btn btn-primary">
              Staff Login
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 animate-slideUp">
            {items.map((item, index) => (
              <div
                key={item._id}
                className="glass-card"
                onClick={() => setDetail(item)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  animationDelay: `${index * 0.1}s`,
                  cursor: 'pointer',
                }}
              >
                {item.kind === 'project' ? (
                  <>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>project</span>
                    </div>

                    <h3 style={{
                      fontSize: '1.25rem',
                      marginBottom: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3
                    }}>
                      {item.title}
                    </h3>

                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      marginBottom: '1.5rem',
                      lineHeight: 1.6,
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.description}
                    </p>

                    {item.tags && item.tags.length > 0 && (
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        marginBottom: '1rem'
                      }}>
                        {item.tags.slice(0, 3).map((tag: string, i: number) => (
                          <span key={i} className="badge" style={{ fontSize: '0.7rem' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        href={`/project/${item._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn btn-ghost"
                        style={{
                          padding: '0.625rem 1rem',
                          fontSize: '0.875rem',
                          flex: 1,
                          justifyContent: 'center'
                        }}
                      >
                        View Project
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </Link>
                      {item.downloadUrl && (
                        <a
                          href={item.downloadUrl}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="btn btn-secondary"
                          style={{
                            padding: '0.625rem 1rem',
                            fontSize: '0.875rem'
                          }}
                          title="Download ZIP"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: '100%',
                        height: '140px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {item.fileType === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl || item.fileUrl}
                          alt={item.originalName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '2.5rem' }}>🗜️</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="badge" style={{ fontSize: '0.65rem' }}>file</span>
                    </div>

                    <h3
                      title={item.originalName}
                      style={{
                        fontSize: '1.05rem',
                        marginBottom: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {item.originalName}
                    </h3>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{item.fileType}</span>
                      {typeof item.fileSize === 'number' && (
                        <span className="badge" style={{ fontSize: '0.7rem' }}>{formatSize(item.fileSize)}</span>
                      )}
                    </div>

                    <a
                      href={`/api/files/${item._id}/download`}
                      download={item.originalName}
                      onClick={(e) => e.stopPropagation()}
                      className="btn btn-secondary"
                      style={{ padding: '0.625rem 1rem', fontSize: '0.875rem', textAlign: 'center' }}
                    >
                      Download
                    </a>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {detail && (
        <DetailModal item={detail as DetailItem} onClose={() => setDetail(null)} />
      )}

      {/* CTA Banner */}
      <section className="container" style={{ paddingBottom: '5rem' }}>
        <div className="glass-card-static" style={{
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(2.5rem, 6vw, 4rem) 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.03) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* decorative blobs */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-block',
              marginBottom: '1rem',
              padding: '0.4rem 0.9rem',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--accent-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              🚀 Ready to dive in?
            </div>

            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1rem',
            }}>
              Start exploring{' '}
              <span className="gradient-text">legendary code</span>
              <br />today — it&apos;s free.
            </h2>

            <p style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              maxWidth: '520px',
              margin: '0 auto 2rem',
              lineHeight: 1.6,
            }}>
              Browse the full library, download projects instantly, and level up your stack with handpicked source code.
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <Link href="/browse" className="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                Browse Library
              </Link>
              <Link href="/support" className="btn btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--card-border)',
        padding: '2rem 0',
        marginTop: 'auto'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
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
                backgroundClip: 'text'
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
                letterSpacing: '0.05em'
              }}>
                Quick Links
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/browse" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Browse
                </Link>
                <Link href="/docs" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Documentation
                </Link>
                <Link href="/files" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Files
                </Link>
                <Link href="/support" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Support
                </Link>
                <Link href="/bot" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Discord Bot
                </Link>
                <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Staff Login
                </Link>
              </div>
            </div>
          </div>

          <div style={{
            paddingTop: '2rem',
            borderTop: '1px solid var(--card-border)',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '0.875rem'
          }}>
            © {new Date().getFullYear()} nova-browser. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
