'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/components/Toast';

interface Props {
  code: string;
  projectId: string;
}

export default function ProjectPageClient({ code, projectId }: Props) {
  const { success, error } = useToast();
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      success('Source code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      error('Failed to copy — try selecting manually.');
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
      {/* Copy source */}
      <button
        onClick={copyCode}
        title="Copy source code"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          padding: '0.35rem 0.7rem',
          background: copied ? 'rgba(34,197,94,0.1)' : 'var(--card-bg)',
          border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--card-border)'}`,
          borderRadius: 'var(--radius-md)',
          color: copied ? 'var(--accent-primary)' : 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '0.78rem',
          fontWeight: 500,
          transition: 'all var(--transition-fast)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {copied ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy code
          </>
        )}
      </button>

      {/* Share */}
      <Link
        href={`/share/${projectId}`}
        title="Share project"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          padding: '0.35rem 0.7rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-secondary)',
          fontSize: '0.78rem',
          fontWeight: 500,
          transition: 'all var(--transition-fast)',
          textDecoration: 'none',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Share
      </Link>
    </div>
  );
}
