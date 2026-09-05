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
    }}>
      {/* Glowing code number */}
      <div style={{
        fontSize: 'clamp(6rem, 20vw, 10rem)',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        lineHeight: 1,
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #22c55e, #4ade80)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 0 40px rgba(34,197,94,0.4))',
      }}>
        404
      </div>

      <div style={{
        display: 'inline-block',
        marginBottom: '1.25rem',
        padding: '0.4rem 1rem',
        background: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: 'var(--radius-full)',
        color: 'var(--accent-primary)',
        fontSize: '0.85rem',
        fontWeight: 600,
      }}>
        Page not found
      </div>

      <h1 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        marginBottom: '0.75rem',
        color: 'var(--text-primary)',
      }}>
        Lost in the void
      </h1>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        maxWidth: '420px',
        lineHeight: 1.7,
        marginBottom: '2.5rem',
      }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
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
