'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

const STYLES: Record<ToastType, { bg: string; border: string; color: string; iconBg: string }> = {
  success: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  color: '#4ade80', iconBg: 'rgba(34,197,94,0.15)'  },
  error:   { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  color: '#f87171', iconBg: 'rgba(239,68,68,0.15)'  },
  info:    { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', color: '#a5b4fc', iconBg: 'rgba(99,102,241,0.15)' },
  warning: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', color: '#fde68a', iconBg: 'rgba(251,191,36,0.15)' },
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 3500) => {
    const id = `toast-${++counterRef.current}`;
    setToasts(prev => [...prev.slice(-4), { id, type, message, duration }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const success = useCallback((m: string) => toast(m, 'success'), [toast]);
  const error   = useCallback((m: string) => toast(m, 'error'),   [toast]);
  const info    = useCallback((m: string) => toast(m, 'info'),    [toast]);
  const warning = useCallback((m: string) => toast(m, 'warning'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 99998,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const s = STYLES[t.type];
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-lg)',
                background: `color-mix(in srgb, var(--bg-secondary) 85%, transparent)`,
                border: `1px solid ${s.border}`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: 'var(--shadow-lg)',
                maxWidth: 'min(340px, 90vw)',
                animation: 'slideInRight 0.25s var(--ease-fast) both',
                pointerEvents: 'auto',
              }}
            >
              {/* Icon */}
              <div style={{
                width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                background: s.iconBg, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {ICONS[t.type]}
              </div>
              {/* Message */}
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4, flex: 1 }}>
                {t.message}
              </span>
              {/* Dismiss */}
              <button
                onClick={() => dismiss(t.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)', padding: '0.1rem',
                  display: 'flex', alignItems: 'center', flexShrink: 0,
                  borderRadius: '4px',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
