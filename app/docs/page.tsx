'use client';

import Link from 'next/link';
import { useState } from 'react';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Param {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}

interface Endpoint {
  method: Method;
  path: string;
  description: string;
  auth?: string;
  queryParams?: Param[];
  bodyParams?: Param[];
  response: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  endpoints: Endpoint[];
}

const METHOD_COLORS: Record<Method, { bg: string; color: string }> = {
  GET:    { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e' },
  POST:   { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8' },
  PUT:    { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
  PATCH:  { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c' },
  DELETE: { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
};

const SECTIONS: Section[] = [
  {
    id: 'projects',
    title: 'Projects (Snippets)',
    description: 'Code projects — the core content of nova-browser.',
    endpoints: [
      { method: 'GET', path: '/api/snippets', description: 'List all projects, newest first.', response: '{ snippets: Project[] }' },
      { method: 'GET', path: '/api/snippets/:id', description: 'Get a single project by ID.', response: '{ project: Project }' },
      { method: 'PUT', path: '/api/snippets/:id', description: 'Update a project. Staff only.', auth: 'Staff JWT cookie',
        bodyParams: [
          { name: 'title', type: 'string', required: true, description: 'Project title' },
          { name: 'description', type: 'string', required: true, description: 'Project description' },
          { name: 'code', type: 'string', required: true, description: 'Raw HTML/code content' },
          { name: 'language', type: 'string', description: 'Primary language (e.g. javascript)' },
          { name: 'tags', type: 'string | string[]', description: 'Comma-separated string or array' },
          { name: 'downloadUrl', type: 'string', description: 'Optional ZIP download URL' },
          { name: 'youtubeUrl', type: 'string', description: 'Optional YouTube tutorial URL' },
        ],
        response: '{ success: true, project: Project }' },
      { method: 'DELETE', path: '/api/snippets/:id', description: 'Delete a project. Staff only.', auth: 'Staff JWT cookie', response: '{ success: true }' },
      { method: 'POST', path: '/api/snippets', description: 'Create a new project. Staff only.', auth: 'Staff JWT cookie',
        bodyParams: [
          { name: 'title', type: 'string', required: true, description: 'Project title' },
          { name: 'description', type: 'string', required: true, description: 'Description' },
          { name: 'code', type: 'string', required: true, description: 'Raw HTML/code content' },
          { name: 'language', type: 'string', description: 'Language' },
          { name: 'tags', type: 'string | string[]', description: 'Tags' },
          { name: 'downloadUrl', type: 'string', description: 'Download URL' },
          { name: 'youtubeUrl', type: 'string', description: 'YouTube URL' },
        ],
        response: '{ success: true, snippet: Project }' },
    ],
  },
  {
    id: 'files',
    title: 'Files',
    description: 'Uploaded assets — images and ZIP files.',
    endpoints: [
      { method: 'GET', path: '/api/files', description: 'List all files.', response: '{ files: File[] }' },
      { method: 'GET', path: '/api/files/:id', description: 'Get a single file record.', response: '{ file: File }' },
      { method: 'GET', path: '/api/files/:id/download', description: 'Download a file as binary. Increments download counter.', response: 'Binary stream (Content-Disposition: inline)' },
    ],
  },
  {
    id: 'stats',
    title: 'Stats',
    description: 'Aggregated site statistics.',
    endpoints: [
      { method: 'GET', path: '/api/stats', description: 'Returns total project count, file count, and total downloads.', response: '{ projects: number, files: number, downloads: number }' },
    ],
  },
  {
    id: 'leaderboard',
    title: 'Leaderboard',
    description: 'Top content by engagement.',
    endpoints: [
      { method: 'GET', path: '/api/leaderboard', description: 'Top 20 projects by views and top 10 files by downloads.', response: '{ projects: Project[], files: File[] }' },
    ],
  },
  {
    id: 'comments',
    title: 'Comments',
    description: 'User comments on projects and files.',
    endpoints: [
      { method: 'GET', path: '/api/comments', description: 'List comments for a target.',
        queryParams: [
          { name: 'targetType', type: '"project" | "file"', required: true, description: 'Type of the target' },
          { name: 'targetId', type: 'string', required: true, description: 'ID of the target document' },
        ],
        response: '{ comments: Comment[] }' },
      { method: 'POST', path: '/api/comments', description: 'Post a comment. No auth required.',
        bodyParams: [
          { name: 'targetType', type: '"project" | "file"', required: true, description: 'Type of the target' },
          { name: 'targetId', type: 'string', required: true, description: 'ID of the target' },
          { name: 'text', type: 'string', required: true, description: 'Comment body (max 1000 chars)' },
          { name: 'username', type: 'string', description: 'Display name (defaults to "Anonymous")' },
        ],
        response: '{ comment: Comment }' },
    ],
  },
  {
    id: 'ratings',
    title: 'Ratings',
    description: 'Star ratings (1–5) on projects.',
    endpoints: [
      { method: 'GET', path: '/api/ratings', description: 'Get average rating and count for a target.',
        queryParams: [
          { name: 'targetType', type: '"project" | "file"', description: 'Defaults to "project"' },
          { name: 'targetId', type: 'string', required: true, description: 'ID of the target' },
        ],
        response: '{ avg: number, count: number }' },
      { method: 'POST', path: '/api/ratings', description: 'Submit or update a rating. Uses voterKey to deduplicate per user.',
        bodyParams: [
          { name: 'targetType', type: '"project" | "file"', description: 'Defaults to "project"' },
          { name: 'targetId', type: 'string', required: true, description: 'ID of the target' },
          { name: 'score', type: 'number (1–5)', required: true, description: 'Star score' },
          { name: 'voterKey', type: 'string', description: 'Unique voter identifier from localStorage' },
        ],
        response: '{ avg: number, count: number }' },
    ],
  },
  {
    id: 'collections',
    title: 'Collections',
    description: 'User-created curated project lists.',
    endpoints: [
      { method: 'GET', path: '/api/collections', description: 'List all collections.', response: '{ collections: Collection[] }' },
      { method: 'POST', path: '/api/collections', description: 'Create a new collection.',
        bodyParams: [
          { name: 'name', type: 'string', required: true, description: 'Collection name (max 100)' },
          { name: 'description', type: 'string', description: 'Optional description (max 500)' },
          { name: 'username', type: 'string', description: 'Author display name' },
          { name: 'projectIds', type: 'string[]', description: 'Initial project IDs' },
        ],
        response: '{ collection: Collection }' },
      { method: 'GET', path: '/api/collections/:id', description: 'Get a single collection.', response: '{ collection: Collection }' },
      { method: 'PATCH', path: '/api/collections/:id', description: 'Add or remove a project from a collection.',
        bodyParams: [
          { name: 'action', type: '"add" | "remove"', required: true, description: 'Operation to perform' },
          { name: 'projectId', type: 'string', required: true, description: 'Project ID to add or remove' },
        ],
        response: '{ collection: Collection }' },
      { method: 'DELETE', path: '/api/collections/:id', description: 'Delete a collection.', response: '{ success: true }' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Site-wide settings (background image, opacity).',
    endpoints: [
      { method: 'GET', path: '/api/settings', description: 'Get current settings.', response: '{ settings: { backgroundUrl: string, backgroundOpacity: number } }' },
      { method: 'PATCH', path: '/api/settings', description: 'Update opacity.',
        bodyParams: [
          { name: 'backgroundOpacity', type: 'number (0–1)', description: 'Background image opacity' },
        ],
        response: '{ settings: Settings }' },
      { method: 'POST', path: '/api/settings/background', description: 'Upload a background image (multipart/form-data).',
        bodyParams: [
          { name: 'file', type: 'File (image/*)', required: true, description: 'Image file, max 8 MB' },
        ],
        response: '{ success: true, backgroundUrl: string }' },
    ],
  },
];

export default function DocsPage() {
  const [active, setActive] = useState('projects');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());

  function toggleEndpoint(key: string) {
    setExpandedEndpoints(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const activeSection = SECTIONS.find(s => s.id === active)!;

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{
        borderBottom: '1px solid var(--card-border)',
        padding: '0.875rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0,
        background: 'rgba(10,10,10,0.9)', backdropFilter: 'var(--glass-blur)',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>← Home</Link>
          <span style={{ color: 'var(--card-border)' }}>|</span>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            API Reference
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>v1.3</span>
          <button onClick={() => setSidebarOpen(v => !v)} className="desktop-hidden btn-icon" style={{ background: 'transparent', padding: '0.4rem' }}>
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', maxWidth: '1280px', margin: '0 auto' }}>
        {/* Sidebar */}
        <aside
          className={sidebarOpen ? '' : 'mobile-hidden'}
          style={{
            width: '240px', flexShrink: 0,
            borderRight: '1px solid var(--card-border)',
            padding: '1.5rem 1rem',
            position: 'sticky', top: '57px',
            height: 'calc(100vh - 57px)', overflowY: 'auto',
          }}
        >
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>Endpoints</p>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => { setActive(s.id); setSidebarOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
              border: 'none', cursor: 'pointer', fontSize: '0.875rem',
              marginBottom: '0.15rem', transition: 'all var(--transition-fast)',
              background: active === s.id ? 'rgba(34,197,94,0.1)' : 'transparent',
              color: active === s.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: active === s.id ? 600 : 400,
              borderLeft: active === s.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
            }}>
              {s.title}
              <span style={{ float: 'right', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{s.endpoints.length}</span>
            </button>
          ))}

          <div style={{ marginTop: '2rem', padding: '0 0.5rem' }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '0.75rem' }}>Quick links</p>
            {[['/', 'Home'], ['/browse', 'Browse Library'], ['/leaderboard', 'Leaderboard'], ['/collections', 'Collections']].map(([href, label]) => (
              <Link key={href} href={href} style={{ display: 'block', padding: '0.4rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</Link>
            ))}
          </div>
        </aside>

        {/* Content */}
        <article style={{ flex: 1, padding: '2rem', minWidth: 0 }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '0.5rem' }}>
              {activeSection.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0' }}>{activeSection.description}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeSection.endpoints.map((ep, i) => {
              const key = `${ep.method}-${ep.path}`;
              const expanded = expandedEndpoints.has(key);
              const colors = METHOD_COLORS[ep.method];
              const hasDetails = ep.auth || ep.queryParams || ep.bodyParams;
              return (
                <div key={i} className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Header row */}
                  <button
                    onClick={() => hasDetails && toggleEndpoint(key)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '1rem 1.25rem', background: 'transparent', border: 'none',
                      cursor: hasDetails ? 'pointer' : 'default', textAlign: 'left',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                      fontFamily: 'var(--font-display)', background: colors.bg, color: colors.color,
                      flexShrink: 0, minWidth: '58px', textAlign: 'center',
                    }}>{ep.method}</span>
                    <code style={{
                      fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-primary)',
                      background: 'var(--card-bg)', padding: '0.2rem 0.6rem', borderRadius: '4px', flexShrink: 0,
                    }}>{ep.path}</code>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flex: 1 }}>{ep.description}</span>
                    {ep.auth && <span className="badge" style={{ fontSize: '0.65rem', flexShrink: 0 }}>🔒 Auth</span>}
                    {hasDetails && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"
                        style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    )}
                  </button>

                  {/* Expanded details */}
                  {expanded && (
                    <div style={{ borderTop: '1px solid var(--card-border)', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {ep.auth && (
                        <div>
                          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.06em' }}>Authentication</p>
                          <span className="badge" style={{ fontSize: '0.8rem' }}>🔒 {ep.auth}</span>
                        </div>
                      )}
                      {ep.queryParams && (
                        <div>
                          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>Query Parameters</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {ep.queryParams.map(p => (
                              <div key={p.name} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <code style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: 'var(--accent-primary)', background: 'rgba(34,197,94,0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px', flexShrink: 0 }}>{p.name}</code>
                                <span style={{ fontSize: '0.78rem', color: '#818cf8', flexShrink: 0 }}>{p.type}</span>
                                {p.required && <span className="badge badge-primary" style={{ fontSize: '0.6rem', flexShrink: 0 }}>required</span>}
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{p.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {ep.bodyParams && (
                        <div>
                          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>Body (JSON)</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {ep.bodyParams.map(p => (
                              <div key={p.name} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <code style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: 'var(--accent-primary)', background: 'rgba(34,197,94,0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px', flexShrink: 0 }}>{p.name}</code>
                                <span style={{ fontSize: '0.78rem', color: '#818cf8', flexShrink: 0 }}>{p.type}</span>
                                {p.required && <span className="badge badge-primary" style={{ fontSize: '0.6rem', flexShrink: 0 }}>required</span>}
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{p.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.06em' }}>Response</p>
                        <code style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: '#4ade80', background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)' }}>
                          {ep.response}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Base URL note */}
          <div className="glass-card-static" style={{ marginTop: '2rem', padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Base URL:</strong>{' '}
              <code style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)', fontSize: '0.82rem' }}>https://your-domain.com</code>
              {' · '}All responses are JSON unless noted. Click any endpoint to expand details.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
