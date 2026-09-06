'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Notif {
  _id: string;
  type: string;
  title: string;
  message: string;
  targetId: string;
  targetType: 'project' | 'file';
  targetName: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_ICON: Record<string, string> = {
  new_project: '📦',
  new_comment: '💬',
  new_file:    '🗂️',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Poll unread count every 30s
  useEffect(() => {
    function fetchCount() {
      fetch('/api/notifications?limit=20')
        .then(r => r.json())
        .then(d => {
          const list: Notif[] = d.notifications || [];
          const stored = localStorage.getItem('nova-notif-read-at');
          const readAt = stored ? parseInt(stored) : 0;
          setUnread(list.filter(n => new Date(n.createdAt).getTime() > readAt).length);
          setNotifs(list);
        })
        .catch(() => {});
    }
    fetchCount();
    const iv = setInterval(fetchCount, 30000);
    return () => clearInterval(iv);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function handleOpen() {
    setOpen(v => !v);
    if (!open) {
      // Mark all as read locally
      localStorage.setItem('nova-notif-read-at', String(Date.now()));
      setUnread(0);
      // Tell server
      fetch('/api/notifications', { method: 'PATCH' }).catch(() => {});
    }
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        style={{
          width: '34px',
          height: '34px',
          borderRadius: 'var(--radius-md)',
          background: open ? 'rgba(34,197,94,0.1)' : 'var(--card-bg)',
          border: `1px solid ${open ? 'rgba(34,197,94,0.3)' : 'var(--card-border)'}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={open ? 'var(--accent-primary)' : 'var(--text-secondary)'} strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '16px',
            height: '16px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-primary)',
            color: '#05130a',
            fontSize: '0.6rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          right: 0,
          width: '320px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 500,
          overflow: 'hidden',
          animation: 'slideDown 0.2s ease-out',
        }}>
          {/* Header */}
          <div style={{
            padding: '0.875rem 1rem',
            borderBottom: '1px solid var(--card-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>
              Notifications
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              Last 20
            </span>
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: 0 }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifs.map(n => {
                const href = n.targetType === 'project'
                  ? `/project/${n.targetId}`
                  : `/files`;
                return (
                  <Link
                    key={n._id}
                    href={href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--card-border)',
                      textDecoration: 'none',
                      transition: 'background var(--transition-fast)',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: '1px' }}>
                      {TYPE_ICON[n.type] || '🔔'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {n.title}
                      </p>
                      <p style={{
                        margin: '0.15rem 0 0',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {n.message}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '2px' }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
