import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -60%)',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* 404 number */}
      <div style={{
        fontSize: 'clamp(7rem, 20vw, 12rem)',
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        background: 'linear-gradient(180deg, var(--text-primary) 40%, var(--text-tertiary) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '1.5rem',
        userSelect: 'none',
      }}>
        404
      </div>

      {/* Label */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 1rem',
        background: 'var(--accent-dim)',
        border: '1px solid var(--accent-border)',
        borderRadius: 'var(--radius-full)',
        color: 'var(--accent-primary)',
        fontSize: '0.8rem',
        fontWeight: 600,
        marginBottom: '1.25rem',
        letterSpacing: '0.02em',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, display: 'inline-block' }} />
        Page not found
      </div>

      <h1 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        marginBottom: '0.75rem',
        letterSpacing: '-0.02em',
      }}>
        You&#39;re lost in the void
      </h1>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        maxWidth: '380px',
        lineHeight: 1.7,
        marginBottom: '2.5rem',
      }}>
        This page doesn&#39;t exist or has been moved. Let&#39;s get you somewhere real.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Back to Home
        </Link>
        <Link href="/browse" className="btn btn-secondary">
          Browse Library
        </Link>
      </div>
    </main>
  );
}
