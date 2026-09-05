'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="en">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        background: '#0a0a0a',
        color: '#f2f5f2',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <div style={{
          fontSize: 'clamp(5rem, 18vw, 9rem)',
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ef4444, #f97316)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          500
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Critical error
        </h1>

        <p style={{ color: '#a3b8ab', fontSize: '1rem', maxWidth: '400px', lineHeight: 1.7, marginBottom: '2rem' }}>
          A fatal error occurred. Please try refreshing the page.
        </p>

        <button
          onClick={reset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1.75rem',
            background: 'linear-gradient(135deg, #22c55e, #4ade80)',
            color: '#05130a',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Reload Page
        </button>
      </body>
    </html>
  );
}
