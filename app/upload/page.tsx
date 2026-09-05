'use client';

import Link from 'next/link';
import { useState, useRef, useCallback } from 'react';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaderName, setUploaderName] = useState('');
  const [uploaderNote, setUploaderNote] = useState('');
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const isImage = file.type.startsWith('image/');
    const isZip = file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed' ||
      file.name.endsWith('.zip');

    if (!isImage && !isZip) {
      setMessage('Only images (PNG, JPG, WEBP, GIF) and ZIP archives are accepted.');
      setStatus('error');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setMessage('File is too large. Maximum size is 25 MB.');
      setStatus('error');
      return;
    }
    setSelectedFile(file);
    setStatus('idle');
    setMessage('');
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  async function handleSubmit() {
    if (!selectedFile) return;
    setStatus('uploading');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('uploaderName', uploaderName.trim() || 'Anonymous');
      formData.append('uploaderNote', uploaderNote.trim());

      const res = await fetch('/api/user-uploads', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Upload failed');

      setStatus('success');
      setMessage(data.message || 'File submitted successfully!');
      setSelectedFile(null);
      setUploaderName('');
      setUploaderNote('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e: any) {
      setStatus('error');
      setMessage(e.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <nav className="glass-card-static" style={{
        margin: '1rem', borderRadius: 'var(--radius-full)',
        padding: '1rem 1.5rem', position: 'sticky', top: '1rem', zIndex: 1000,
        animation: 'slideDown 0.6s ease-out',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{
            fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'var(--font-display)',
            background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>nova-browser</Link>

          <div className="mobile-hidden" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {[['/', 'Home'], ['/browse', 'Browse'], ['/upload', 'Upload'], ['/files', 'Files'], ['/support', 'Support']].map(([href, label]) => (
              <Link key={href} href={href} style={{
                color: href === '/upload' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: href === '/upload' ? 600 : 500,
                transition: 'color var(--transition-fast)',
              }}>{label}</Link>
            ))}
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9rem' }}>
              Staff Login
            </Link>
          </div>

          <button className="desktop-hidden btn-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu" style={{ padding: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="desktop-hidden" style={{
            marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)',
            display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'slideDown 0.3s ease-out',
          }}>
            {[['/', 'Home'], ['/browse', 'Browse'], ['/upload', 'Upload'], ['/files', 'Files'], ['/support', 'Support']].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} style={{
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)', fontWeight: 500,
              }}>{label}</Link>
            ))}
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary"
              style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Staff Login</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="container animate-fadeIn" style={{ textAlign: 'center', padding: '4rem 0 2.5rem' }}>
        <div style={{
          display: 'inline-block', marginBottom: '1rem', padding: '0.5rem 1rem',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 'var(--radius-full)', color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600,
        }}>
          📤 Community Upload
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: 'var(--font-display)',
          fontWeight: 800, lineHeight: 1.1, marginBottom: '0.75rem',
        }}>
          Share your files with the <span className="gradient-text">community</span>
        </h1>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '1rem',
          maxWidth: '500px', margin: '0 auto', lineHeight: 1.7,
        }}>
          Upload an image or ZIP archive. Staff will review it before it goes live — usually within 24 hours.
        </p>
      </section>

      {/* Upload form */}
      <section className="container" style={{ paddingBottom: '5rem', maxWidth: '620px' }}>

        {/* Success state */}
        {status === 'success' ? (
          <div className="glass-card-static" style={{
            textAlign: 'center', padding: '3rem 2rem',
            border: '1px solid rgba(34,197,94,0.3)',
            background: 'rgba(34,197,94,0.05)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.75rem' }}>
              Upload submitted!
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setStatus('idle')} className="btn btn-primary">
                Upload another
              </button>
              <Link href="/files" className="btn btn-secondary">View approved files</Link>
            </div>
          </div>
        ) : (
          <div className="glass-card-static" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Drop zone */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.6rem' }}>
                File <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.zip,application/zip,application/x-zip-compressed"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--accent-primary)' : selectedFile ? 'rgba(34,197,94,0.4)' : 'var(--card-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: dragOver ? 'rgba(34,197,94,0.05)' : selectedFile ? 'rgba(34,197,94,0.03)' : 'var(--card-bg)',
                  padding: '2rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all var(--transition-fast)',
                  minHeight: '140px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                }}
              >
                {selectedFile ? (
                  <>
                    <div style={{ fontSize: '2.5rem' }}>
                      {selectedFile.type.startsWith('image/') ? '🖼️' : '🗜️'}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      {formatSize(selectedFile.size)} · Click to change
                    </div>
                  </>
                ) : (
                  <>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                      {dragOver ? 'Drop it here!' : 'Drag & drop or click to browse'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                      PNG, JPG, WEBP, GIF, ZIP · Max 25 MB
                    </div>
                  </>
                )}
              </div>
              {status === 'error' && message && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#f87171' }}>{message}</p>
              )}
            </div>

            {/* Uploader name */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                Your name <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Anonymous"
                value={uploaderName}
                onChange={e => setUploaderName(e.target.value)}
                maxLength={64}
                style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.95rem', width: '100%', outline: 'none' }}
              />
            </div>

            {/* Note */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                Note for reviewers <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                placeholder="Describe what this file is, its purpose, or any relevant info…"
                value={uploaderNote}
                onChange={e => setUploaderNote(e.target.value)}
                maxLength={500}
                rows={3}
                style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.95rem', width: '100%', resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                {uploaderNote.length}/500
              </div>
            </div>

            {/* Rules */}
            <div style={{
              background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem',
            }}>
              <p style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600, marginBottom: '0.4rem' }}>📋 Upload guidelines</p>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {[
                  'No malware, exploits, or harmful scripts',
                  'No NSFW or illegal content',
                  'ZIP files must contain source code or assets only',
                  'Duplicate or spam submissions will be rejected',
                ].map(rule => (
                  <li key={rule} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || status === 'uploading'}
              className="btn btn-primary"
              style={{ width: '100%', opacity: !selectedFile ? 0.5 : 1, fontSize: '1rem', padding: '0.875rem' }}
            >
              {status === 'uploading' ? (
                <><span className="animate-pulse">⏳</span> Uploading…</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Submit for Review
                </>
              )}
            </button>
          </div>
        )}

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          {[
            { icon: '🔍', title: 'Reviewed by staff', desc: 'Every submission is manually checked before going live.' },
            { icon: '⚡', title: 'Fast approval', desc: 'Most files are reviewed within 24 hours.' },
            { icon: '🌍', title: 'Public once approved', desc: 'Approved files appear in the Files section for everyone.' },
          ].map(card => (
            <div key={card.title} className="glass-card-static" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{card.icon}</div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>{card.title}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          © {new Date().getFullYear()} nova-browser —{' '}
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>Home</Link>
          {' · '}
          <Link href="/files" style={{ color: 'var(--text-tertiary)' }}>View Files</Link>
        </div>
      </footer>
    </main>
  );
}
