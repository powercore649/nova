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
  useEffect(() => { console.error(error); }, [error]);

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
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -60%)',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        fontSize: 'clamp(7rem, 20vw, 12rem)',
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        background: 'linear-gradient(180deg, #ef4444 0%, #991b1b 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '1.5rem',
        userSelect: 'none',
      }}>
        500
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 1rem',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 'var(--radius-full)',
        color: '#f87171',
        fontSize: '0.8rem',
        fontWeight: 600,
        marginBottom: '1.25rem',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', flexShrink: 0, display: 'inline-block' }} />
        Something went wrong
      </div>

      <h1 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        marginBottom: '0.75rem',
        letterSpacing: '-0.02em',
      }}>
        Unexpected error
      </h1>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        maxWidth: '380px',
        lineHeight: 1.7,
        marginBottom: '2.5rem',
      }}>
        Something broke on our end. You can try again or go back home.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={reset} className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-4"/>
          </svg>
          Try Again
        </button>
        <Link href="/" className="btn btn-secondary">Back to Home</Link>
      </div>
    </main>
  );
}
