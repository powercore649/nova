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

      {/* Floating particles */}
      {[
        { top: '15%', left: '8%',  size: 8,  opacity: 0.25, delay: '0s' },
        { top: '25%', left: '18%', size: 14, opacity: 0.15, delay: '0.4s' },
        { top: '60%', left: '6%',  size: 6,  opacity: 0.2,  delay: '0.8s' },
        { top: '75%', left: '20%', size: 10, opacity: 0.12, delay: '0.2s' },
        { top: '40%', left: '4%',  size: 18, opacity: 0.08, delay: '1s' },
        { top: '10%', right: '10%', size: 10, opacity: 0.2, delay: '0.6s' },
        { top: '30%', right: '6%',  size: 16, opacity: 0.12, delay: '0s' },
        { top: '55%', right: '12%', size: 8,  opacity: 0.22, delay: '0.3s' },
        { top: '70%', right: '20%', size: 12, opacity: 0.1,  delay: '0.9s' },
        { top: '85%', right: '8%',  size: 6,  opacity: 0.18, delay: '0.5s' },
        { top: '80%', left: '45%',  size: 8,  opacity: 0.15, delay: '0.7s' },
        { top: '5%',  left: '40%',  size: 10, opacity: 0.1,  delay: '1.1s' },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: p.top,
          left: (p as any).left,
          right: (p as any).right,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '50%',
          background: 'rgba(34,197,94,0.35)',
          opacity: p.opacity,
          animation: `float ${2 + (i % 3) * 0.5}s ease-in-out ${p.delay} infinite alternate`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Rings loader */}
      <div style={{
        position: 'relative',
        width: '180px',
        height: '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.4s var(--ease-fast) both',
      }}>
        {/* Ring 1 — outer, slow */}
        <svg style={{ position: 'absolute', inset: 0, animation: 'spin 3s linear infinite' }} width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r="82" fill="none" stroke="rgba(34,197,94,0.12)" strokeWidth="2" />
          <circle cx="90" cy="90" r="82" fill="none" stroke="#22c55e" strokeWidth="2"
            strokeDasharray="90 428" strokeDashoffset="0" strokeLinecap="round" />
          <circle cx="90" cy="90" r="82" fill="none" stroke="#22c55e" strokeWidth="2"
            strokeDasharray="40 428" strokeDashoffset="-180" strokeLinecap="round" />
        </svg>

        {/* Ring 2 — mid, medium */}
        <svg style={{ position: 'absolute', inset: '18px', animation: 'spin 2s linear infinite reverse' }} width="144" height="144" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r="64" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="2" />
          <circle cx="72" cy="72" r="64" fill="none" stroke="#4ade80" strokeWidth="2.5"
            strokeDasharray="70 332" strokeDashoffset="0" strokeLinecap="round" />
          <circle cx="72" cy="72" r="64" fill="none" stroke="#4ade80" strokeWidth="2.5"
            strokeDasharray="30 332" strokeDashoffset="-140" strokeLinecap="round" />
        </svg>

        {/* Ring 3 — inner, fast */}
        <svg style={{ position: 'absolute', inset: '36px', animation: 'spin 1.4s linear infinite' }} width="108" height="108" viewBox="0 0 108 108">
          <circle cx="54" cy="54" r="46" fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="2" />
          <circle cx="54" cy="54" r="46" fill="none" stroke="#22c55e" strokeWidth="3"
            strokeDasharray="55 239" strokeDashoffset="0" strokeLinecap="round" />
        </svg>

        {/* Center text */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          zIndex: 1,
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
          }}>
            nova
          </span>
        </div>
      </div>

      {/* Wordmark below rings */}
      <div style={{
        marginTop: '2rem',
        fontFamily: 'var(--font-display)',
        fontSize: '1.5rem',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        background: 'var(--accent-gradient)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'slideUp 0.5s var(--ease-fast) 0.15s both',
      }}>
        nova-browser
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
