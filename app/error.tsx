'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
      <div style={{
        fontSize: 'clamp(6rem, 20vw, 10rem)',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        lineHeight: 1,
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #ef4444, #f97316)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 0 40px rgba(239,68,68,0.4))',
      }}>
        500
      </div>

      <div style={{
        display: 'inline-block',
        marginBottom: '1.25rem',
        padding: '0.4rem 1rem',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 'var(--radius-full)',
        color: '#f87171',
        fontSize: '0.85rem',
        fontWeight: 600,
      }}>
        Something went wrong
      </div>

      <h1 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        marginBottom: '0.75rem',
        color: 'var(--text-primary)',
      }}>
        Unexpected error
      </h1>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        maxWidth: '420px',
        lineHeight: 1.7,
        marginBottom: '2.5rem',
      }}>
        Something broke on our end. You can try again or head back to the home page.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={reset} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-4" />
          </svg>
          Try Again
        </button>
        <Link href="/" className="btn btn-secondary">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
