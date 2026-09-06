'use client';

import { useState, useEffect, useCallback } from 'react';

export default function OfflineDetector() {
  const [offline, setOffline] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [dots, setDots] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  // Probe real connectivity (not just navigator.onLine which can lie)
  const probe = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/stats', {
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(4000),
      });
      return res.ok || res.status < 500;
    } catch {
      return false;
    }
  }, []);

  const handleOffline = useCallback(() => {
    setOffline(true);
    setReconnecting(false);
    setAttempts(0);
    setTimeout(() => setFadeIn(true), 10);
  }, []);

  const handleOnline = useCallback(async () => {
    // browser fired 'online' — verify with real probe
    setReconnecting(true);
    setAttempts(a => a + 1);
    const ok = await probe();
    if (ok) {
      setFadeIn(false);
      setTimeout(() => { setOffline(false); setReconnecting(false); }, 400);
    } else {
      setReconnecting(false);
    }
  }, [probe]);

  // Listen to browser events
  useEffect(() => {
    // Set initial state
    if (!navigator.onLine) handleOffline();

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [handleOffline, handleOnline]);

  // Auto-retry every 5s while offline
  useEffect(() => {
    if (!offline) return;
    const iv = setInterval(async () => {
      if (navigator.onLine) {
        setReconnecting(true);
        setAttempts(a => a + 1);
        const ok = await probe();
        if (ok) {
          setFadeIn(false);
          setTimeout(() => { setOffline(false); setReconnecting(false); }, 400);
        } else {
          setReconnecting(false);
        }
      }
    }, 5000);
    return () => clearInterval(iv);
  }, [offline, probe]);

  // Animated ellipsis
  useEffect(() => {
    if (!offline) return;
    const iv = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(iv);
  }, [offline]);

  if (!offline) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      opacity: fadeIn ? 1 : 0,
      transition: 'opacity 0.35s ease',
      padding: '2rem',
    }}>

      {/* Particles */}
      {[
        { top: '12%', left: '7%',  size: 8,  opacity: 0.15 },
        { top: '28%', left: '15%', size: 12, opacity: 0.1  },
        { top: '65%', left: '5%',  size: 6,  opacity: 0.18 },
        { top: '78%', left: '22%', size: 10, opacity: 0.12 },
        { top: '10%', right: '9%',  size: 10, opacity: 0.15 },
        { top: '35%', right: '5%',  size: 14, opacity: 0.1  },
        { top: '60%', right: '14%', size: 7,  opacity: 0.18 },
        { top: '82%', right: '20%', size: 9,  opacity: 0.12 },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: p.top,
          left: (p as any).left,
          right: (p as any).right,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.5)',
          opacity: p.opacity,
          animation: `float ${2.5 + (i % 3) * 0.6}s ease-in-out ${i * 0.2}s infinite alternate`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Rings — red theme */}
      <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Outer ring */}
        <svg style={{ position: 'absolute', inset: 0, animation: reconnecting ? 'spin 1.2s linear infinite' : 'spin 4s linear infinite' }} width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r="82" fill="none" stroke="rgba(239,68,68,0.1)" strokeWidth="2" />
          <circle cx="90" cy="90" r="82" fill="none" stroke="#ef4444" strokeWidth="2"
            strokeDasharray="80 428" strokeDashoffset="0" strokeLinecap="round" />
          <circle cx="90" cy="90" r="82" fill="none" stroke="#ef4444" strokeWidth="2"
            strokeDasharray="35 428" strokeDashoffset="-200" strokeLinecap="round" />
        </svg>

        {/* Mid ring */}
        <svg style={{ position: 'absolute', inset: '18px', animation: reconnecting ? 'spin 0.9s linear infinite reverse' : 'spin 3s linear infinite reverse' }} width="144" height="144" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r="64" fill="none" stroke="rgba(239,68,68,0.08)" strokeWidth="2" />
          <circle cx="72" cy="72" r="64" fill="none" stroke="#f87171" strokeWidth="2.5"
            strokeDasharray="60 332" strokeDashoffset="0" strokeLinecap="round" />
          <circle cx="72" cy="72" r="64" fill="none" stroke="#f87171" strokeWidth="2.5"
            strokeDasharray="25 332" strokeDashoffset="-150" strokeLinecap="round" />
        </svg>

        {/* Inner ring */}
        <svg style={{ position: 'absolute', inset: '36px', animation: reconnecting ? 'spin 0.7s linear infinite' : 'spin 2s linear infinite' }} width="108" height="108" viewBox="0 0 108 108">
          <circle cx="54" cy="54" r="46" fill="none" stroke="rgba(239,68,68,0.07)" strokeWidth="2" />
          <circle cx="54" cy="54" r="46" fill="none" stroke="#ef4444" strokeWidth="3"
            strokeDasharray="50 239" strokeDashoffset="0" strokeLinecap="round" />
        </svg>

        {/* Center icon */}
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
          {reconnecting ? (
            // Spinning wifi icon when reconnecting
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: 'spin 1s linear infinite' }}>
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/>
            </svg>
          ) : (
            // No-wifi icon
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
              <line x1="12" y1="20" x2="12.01" y2="20"/>
            </svg>
          )}
        </div>
      </div>

      {/* Text */}
      <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.35rem 0.875rem',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius-full)',
          color: '#f87171', fontSize: '0.75rem', fontWeight: 600,
          marginBottom: '0.5rem',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
          {reconnecting ? 'Reconnecting…' : 'No connection'}
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
        }}>
          {reconnecting ? `Checking connection${dots}` : `You're offline${dots}`}
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '320px', lineHeight: 1.6, marginTop: '0.25rem' }}>
          {reconnecting
            ? `Attempt ${attempts} — verifying connection to nova-browser…`
            : 'Check your internet connection. The page will reload automatically when you reconnect.'}
        </p>

        {/* Manual retry */}
        {!reconnecting && (
          <button
            onClick={handleOnline}
            style={{
              marginTop: '1.25rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0 1.25rem', height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4"/>
            </svg>
            Try again
          </button>
        )}
      </div>

      {/* Bottom branding */}
      <div style={{
        position: 'absolute', bottom: '2rem',
        fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700,
        letterSpacing: '-0.02em',
        background: 'var(--accent-gradient)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        opacity: 0.6,
      }}>
        nova-browser
      </div>
    </div>
  );
}
