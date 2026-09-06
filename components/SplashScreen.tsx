'use client';

import { useState, useEffect } from 'react';

const MESSAGES = [
  'Connecting to the library…',
  'Loading premium content…',
  'Preparing your experience…',
  'Almost ready…',
];

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const DURATION = 2500; // ms

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem('nova-splash-shown')) return;
    sessionStorage.setItem('nova-splash-shown', '1');
    setVisible(true);

    // Progress bar
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(p);
      if (p < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Cycle messages
    const msgInterval = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length);
    }, DURATION / MESSAGES.length);

    // Fade out then hide
    const fadeTimer = setTimeout(() => setFadeOut(true), DURATION - 400);
    const hideTimer = setTimeout(() => setVisible(false), DURATION);

    return () => {
      clearInterval(msgInterval);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.4s ease',
      pointerEvents: fadeOut ? 'none' : 'auto',
    }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -60%)',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 65%)',
        pointerEvents: 'none',
        animation: 'pulse 2s ease-in-out infinite',
      }} />

      {/* Logo */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        animation: 'slideUp 0.5s var(--ease-fast) both',
      }}>
        {/* Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
          border: '1px solid rgba(34,197,94,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px rgba(34,197,94,0.15)',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 7h6M9 11h4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Wordmark */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.75rem',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          nova-browser
        </div>
      </div>

      {/* Progress area */}
      <div style={{
        position: 'absolute',
        bottom: '3rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(280px, 80vw)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.875rem',
        animation: 'fadeIn 0.6s var(--ease-fast) 0.2s both',
      }}>
        {/* Message */}
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-tertiary)',
          fontWeight: 500,
          letterSpacing: '0.01em',
          height: '1.2em',
          transition: 'opacity 0.3s ease',
        }}>
          {MESSAGES[msgIndex]}
        </p>

        {/* Track */}
        <div style={{
          width: '100%',
          height: '2px',
          background: 'var(--card-border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}>
          {/* Fill */}
          <div style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-gradient)',
            boxShadow: '0 0 8px rgba(34,197,94,0.6)',
            transition: 'width 0.1s linear',
          }} />
        </div>

        {/* Percent */}
        <p style={{
          fontSize: '0.7rem',
          color: 'var(--text-disabled)',
          fontFamily: 'var(--font-mono)',
        }}>
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
