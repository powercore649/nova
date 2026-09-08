'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Project {
  _id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  views: number;
}

interface Props {
  currentId: string;
  tags: string[];
  language: string;
}

export default function RelatedProjects({ currentId, tags, language }: Props) {
  const [related, setRelated] = useState<Project[]>([]);

  useEffect(() => {
    fetch('/api/snippets')
      .then(r => r.json())
      .then(d => {
        const all: Project[] = d.snippets || [];
        // Score by tag overlap + language match
        const scored = all
          .filter(p => p._id !== currentId)
          .map(p => {
            const tagScore = (p.tags || []).filter(t => tags.includes(t)).length;
            const langScore = p.language === language ? 1 : 0;
            return { ...p, score: tagScore * 2 + langScore };
          })
          .filter(p => p.score > 0)
          .sort((a, b) => b.score - a.score || b.views - a.views)
          .slice(0, 3);
        setRelated(scored);
      })
      .catch(() => {});
  }, [currentId, tags, language]);

  if (!related.length) return null;

  return (
    <section style={{ borderTop: '1px solid var(--card-border)', padding: '1.25rem 1rem', background: 'var(--bg-secondary)' }}>
      <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>
        You might also like
      </h3>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {related.map(p => (
          <Link key={p._id} href={`/project/${p._id}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.75rem',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem', color: 'var(--text-secondary)',
              fontWeight: 500, textDecoration: 'none',
              transition: 'all var(--transition-fast)',
              maxWidth: '220px',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >
            <span>📦</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
            {p.views > 0 && <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>{p.views}v</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
