'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DetailModal, { DetailItem } from '@/components/DetailModal';
import { useState } from 'react';

interface FileData {
  _id: string;
  originalName?: string;
  filename?: string;
  fileType: 'image' | 'zip';
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  youtubeUrl?: string;
  accentColor?: string;
  uploadedBy?: string;
  uploaderName?: string;
  downloads: number;
  createdAt: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDetailClient({ file }: { file: FileData }) {
  const [modalOpen, setModalOpen] = useState(false);
  const accent = file.accentColor || '#22c55e';
  const name = file.originalName || file.filename || 'File';
  const uploader = file.uploaderName || file.uploadedBy || 'Staff';

  const modalItem: DetailItem = {
    _id: file._id,
    kind: 'file',
    originalName: name,
    fileType: file.fileType,
    fileUrl: file.fileUrl,
    thumbnailUrl: file.thumbnailUrl,
    fileSize: file.fileSize,
    youtubeUrl: file.youtubeUrl,
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section className="container animate-fadeIn" style={{ padding: '3rem 0 5rem', maxWidth: '860px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>Home</Link>
          <span>/</span>
          <Link href="/files" style={{ color: 'var(--text-tertiary)' }}>Files</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2.5rem', alignItems: 'start', flexWrap: 'wrap' }}>

          {/* Left — info */}
          <div style={{ minWidth: 0 }}>
            {/* Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                {file.fileType === 'zip' ? '🗜️ ZIP' : '🖼️ Image'}
              </span>
              <span className="badge" style={{ fontSize: '0.75rem' }}>{formatSize(file.fileSize)}</span>
              <span className="badge" style={{ fontSize: '0.75rem' }}>
                {new Date(file.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '0.75rem',
              wordBreak: 'break-word',
            }}>
              {name}
            </h1>

            {/* Meta */}
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
              Uploaded by <strong style={{ color: 'var(--text-secondary)' }}>{uploader}</strong>
              {' · '}
              <span>{file.downloads} download{file.downloads !== 1 ? 's' : ''}</span>
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href={`/api/files/${file._id}/download`}
                download={name}
                className="btn btn-primary"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  color: '#fff',
                  boxShadow: `0 0 20px ${accent}44`,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
              </a>

              <button
                onClick={() => setModalOpen(true)}
                className="btn btn-secondary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Comments & more
              </button>

              {/* Share / copy link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="btn btn-ghost"
                title="Copy link"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Right — thumbnail or icon */}
          <div style={{
            width: '220px',
            flexShrink: 0,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: `1px solid ${accent}33`,
            background: 'var(--bg-tertiary)',
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {file.fileType === 'image' && file.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.thumbnailUrl}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🗜️</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', wordBreak: 'break-all' }}>
                  {file.mimeType}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Accent color bar */}
        <div style={{
          marginTop: '3rem',
          height: '3px',
          borderRadius: 'var(--radius-full)',
          background: `linear-gradient(90deg, ${accent}, ${accent}44, transparent)`,
        }} />

        {/* File info card */}
        <div className="glass-card-static" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem' }}>
          {[
            { label: 'Type', value: file.fileType.toUpperCase() },
            { label: 'Size', value: formatSize(file.fileSize) },
            { label: 'Downloads', value: String(file.downloads) },
            { label: 'Uploaded', value: new Date(file.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
            { label: 'MIME', value: file.mimeType },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
                {label}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Modal with comments/ratings/collections/bookmark */}
      {modalOpen && (
        <DetailModal item={modalItem} onClose={() => setModalOpen(false)} />
      )}

      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          © {new Date().getFullYear()} nova-browser —{' '}
          <Link href="/files" style={{ color: 'var(--text-tertiary)' }}>Back to Files</Link>
        </div>
      </footer>
    </main>
  );
}
