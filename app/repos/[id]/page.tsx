'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';

interface Repo {
  _id: string;
  name: string;
  description: string;
  ownerName: string;
  visibility: 'public' | 'private';
  readme: string;
  stars: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
}

interface RepoFile {
  _id: string;
  path: string;
  name: string;
  folder: string;
  size: number;
  mimeType: string;
  isText: boolean;
  commitMessage: string;
  uploaderName: string;
  updatedAt: string;
}

interface Commit {
  _id: string;
  message: string;
  uploaderName: string;
  sha: string;
  filesChanged: string[];
  filesAdded: number;
  filesModified: number;
  filesDeleted: number;
  createdAt: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(date: string) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

// Minimal markdown renderer (bold, italic, code, headings, links, lists)
function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^(#{1,6})\s+(.+)$/gm, (_, h, t) => `<h${h.length} style="margin:${h.length === 1 ? '0 0 1rem' : '1.25rem 0 0.5rem'};font-family:var(--font-display);letter-spacing:-0.02em">${t}</h${h.length}>`)
    .replace(/```([\s\S]*?)```/g, '<pre style="background:var(--bg-tertiary);border:1px solid var(--card-border);border-radius:8px;padding:1rem;overflow-x:auto;margin:1rem 0"><code style="font-family:var(--font-mono);font-size:0.85rem">$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-tertiary);border:1px solid var(--card-border);border-radius:4px;padding:0.15rem 0.4rem;font-family:var(--font-mono);font-size:0.85rem">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--accent-primary)" target="_blank" rel="noopener">$1</a>')
    .replace(/^[-*+]\s+(.+)$/gm, '<li style="margin:0.25rem 0;color:var(--text-secondary)">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, s => `<ul style="padding-left:1.5rem;margin:0.75rem 0">${s}</ul>`)
    .replace(/^(?!<[h|p|u|l|p|c|b|s]).+$/gm, '<p style="margin:0.6rem 0;color:var(--text-secondary);line-height:1.7">$&</p>')
    .replace(/<p[^>]*><\/p>/g, '');
}

// Build folder tree from flat file list
function buildTree(files: RepoFile[], currentFolder: string) {
  const inFolder = files.filter(f => f.folder === currentFolder);
  // Subfolders at this level
  const subFolders = Array.from(new Set(
    files
      .filter(f => f.folder.startsWith(currentFolder ? currentFolder + '/' : '') && f.folder !== currentFolder)
      .map(f => {
        const rest = currentFolder ? f.folder.slice(currentFolder.length + 1) : f.folder;
        return (currentFolder ? currentFolder + '/' : '') + rest.split('/')[0];
      })
  ));
  return { files: inFolder, subFolders };
}

export default function RepoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { success, error } = useToast();
  const [repo, setRepo] = useState<Repo | null>(null);
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'files' | 'commits' | 'readme'>('files');
  const [currentFolder, setCurrentFolder] = useState('');
  const [starred, setStarred] = useState(false);
  const [viewingFile, setViewingFile] = useState<RepoFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [fileLoading, setFileLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/repos/${id}`).then(r => r.json()),
      fetch(`/api/repos/${id}/files`).then(r => r.json()),
      fetch(`/api/repos/${id}/commits`).then(r => r.json()),
    ]).then(([rd, fd, cd]) => {
      setRepo(rd.repo);
      setFiles(fd.files || []);
      setCommits(cd.commits || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  async function openFile(file: RepoFile) {
    setViewingFile(file);
    setFileLoading(true);
    try {
      const res = await fetch(`/api/repos/${id}/files/${file._id}`);
      const data = await res.json();
      setFileContent(data.file?.content || '');
    } catch { setFileContent(''); }
    finally { setFileLoading(false); }
  }

  function toggleStar() {
    const next = !starred;
    setStarred(next);
    if (repo) {
      const newStars = next ? repo.stars + 1 : Math.max(0, repo.stars - 1);
      setRepo({ ...repo, stars: newStars });
      fetch(`/api/repos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stars: newStars }) }).catch(() => {});
    }
  }

  async function copyCloneUrl() {
    const url = `${window.location.origin}/api/repos/${id}/download`;
    await navigator.clipboard.writeText(url).catch(() => {});
    success('Download URL copied!');
  }

  if (loading) return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="container" style={{ padding: '3rem 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-md)' }} />)}
        </div>
      </div>
    </main>
  );

  if (!repo) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Navbar />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>Repository not found</h2>
        <Link href="/repos" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Repos</Link>
      </div>
    </main>
  );

  const { files: currentFiles, subFolders } = buildTree(files, currentFolder);
  const breadcrumbs = currentFolder ? ['root', ...currentFolder.split('/')] : ['root'];

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* File viewer modal */}
      {viewingFile && (
        <div onClick={() => setViewingFile(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '860px', maxHeight: '85vh', background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{viewingFile.path}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{formatSize(viewingFile.size)}</span>
                <button onClick={() => setViewingFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {fileLoading ? (
                <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-md)' }} />
              ) : viewingFile.isText ? (
                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>{fileContent}</pre>
              ) : fileContent.startsWith('data:image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fileContent} alt={viewingFile.name} style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗜️</div>
                  <p>Binary file — cannot preview</p>
                  <a href={`/api/repos/${id}/download`} className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Download repo</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ padding: '2rem 0 5rem' }}>
        {/* Repo header */}
        <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <Link href="/repos" style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Repositories</Link>
              <span style={{ color: 'var(--text-tertiary)' }}>/</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{repo.ownerName}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>/</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{repo.name}</span>
              <span className="badge" style={{ fontSize: '0.65rem' }}>
                {repo.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
              </span>
            </div>
            {repo.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '600px' }}>{repo.description}</p>
            )}
          </div>
          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={toggleStar} className="btn btn-secondary" style={{ gap: '0.4rem' }}>
              {starred ? '⭐' : '☆'} Star {repo.stars > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{repo.stars}</span>}
            </button>
            <button onClick={copyCloneUrl} className="btn btn-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy URL
            </button>
            <a href={`/api/repos/${id}/download`} download={`${repo.ownerName}-${repo.name}.zip`} className="btn btn-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download ZIP
            </a>
            <Link href={`/repos/${id}/upload`} className="btn btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload files
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {[
            { icon: '📄', label: `${files.length} files` },
            { icon: '📝', label: `${commits.length} commits` },
            { icon: '🌿', label: repo.defaultBranch },
          ].map(s => (
            <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <span>{s.icon}</span>{s.label}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--card-border)', marginBottom: '1.5rem' }}>
          {(['files', 'commits', 'readme'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.625rem 1.1rem', border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: tab === t ? 600 : 400,
              color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: tab === t ? '2px solid var(--accent-primary)' : '2px solid transparent',
              marginBottom: '-1px', transition: 'all var(--transition-fast)', fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              {t === 'files' ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg> Files</>
              : t === 'commits' ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg> Commits</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> README</>}
            </button>
          ))}
        </div>

        {/* Files tab */}
        {tab === 'files' && (
          <div>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              {breadcrumbs.map((crumb, i) => {
                const path = i === 0 ? '' : breadcrumbs.slice(1, i + 1).join('/');
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {i > 0 && <span style={{ color: 'var(--text-tertiary)' }}>/</span>}
                    {isLast ? (
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{crumb}</span>
                    ) : (
                      <button onClick={() => setCurrentFolder(path)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', padding: 0 }}>{crumb}</button>
                    )}
                  </span>
                );
              })}
            </div>

            {files.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📂</div>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Empty repository</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Get started by uploading your first file.</p>
                <Link href={`/repos/${id}/upload`} className="btn btn-primary">Upload files</Link>
              </div>
            ) : (
              <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                {/* Latest commit line */}
                {commits[0] && (
                  <div style={{ padding: '0.625rem 1.25rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{commits[0].message}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{commits[0].sha.slice(0, 7)}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{timeAgo(commits[0].createdAt)}</span>
                  </div>
                )}

                {/* Go up */}
                {currentFolder && (
                  <div onClick={() => setCurrentFolder(currentFolder.includes('/') ? currentFolder.split('/').slice(0, -1).join('/') : '')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1.25rem', borderBottom: '1px solid var(--card-border)', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>..</span>
                  </div>
                )}

                {/* Subfolders */}
                {subFolders.map(folder => {
                  const folderName = folder.split('/').pop();
                  return (
                    <div key={folder} onClick={() => setCurrentFolder(folder)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1.25rem', borderBottom: '1px solid var(--card-border)', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                      <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{folderName}</span>
                    </div>
                  );
                })}

                {/* Files */}
                {currentFiles.map((file, i) => (
                  <div key={file._id} onClick={() => openFile(file)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1.25rem', borderBottom: i < currentFiles.length - 1 ? '1px solid var(--card-border)' : 'none', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                    <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'none' }}>{file.commitMessage}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>{formatSize(file.size)}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>{timeAgo(file.updatedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Commits tab */}
        {tab === 'commits' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {commits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>No commits yet</div>
            ) : commits.map((c, i) => (
              <div key={c._id} className="glass-card-static" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{c.message}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span>{c.uploaderName}</span>
                      {c.filesAdded > 0 && <span style={{ color: '#4ade80' }}>+{c.filesAdded} added</span>}
                      {c.filesModified > 0 && <span style={{ color: '#fbbf24' }}>~{c.filesModified} modified</span>}
                      {c.filesDeleted > 0 && <span style={{ color: '#f87171' }}>-{c.filesDeleted} deleted</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-primary)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', display: 'inline-block', marginBottom: '0.2rem' }}>{c.sha.slice(0, 7)}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{timeAgo(c.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* README tab */}
        {tab === 'readme' && (
          <div className="glass-card-static" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            {repo.readme ? (
              <div
                style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(repo.readme) }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>No README yet. Upload a README.md file to display it here.</div>
            )}
          </div>
        )}
      </div>

      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          © {new Date().getFullYear()} nova-browser
        </div>
      </footer>
    </main>
  );
}
