'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Dashboard() {
    const [snippets, setSnippets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Background state
    const [currentBg, setCurrentBg] = useState('');
    const [bgOpacity, setBgOpacity] = useState(0.15);
    const [bgPreview, setBgPreview] = useState('');
    const [bgUploading, setBgUploading] = useState(false);
    const [bgSaving, setBgSaving] = useState(false);
    const [bgMsg, setBgMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleBgUpload(file: File) {
        setBgUploading(true);
        setBgMsg('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/settings/background', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            setCurrentBg(data.backgroundUrl);
            setBgPreview('');
            setBgMsg('✓ Background updated successfully');
        } catch (err: any) {
            setBgMsg(`✗ ${err.message ?? 'Upload failed. Please try again.'}`);
        } finally {
            setBgUploading(false);
        }
    }

    useEffect(() => {
        fetch('/api/snippets')
            .then(res => res.json())
            .then(data => {
                if (data.snippets) setSnippets(data.snippets);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Load current background settings
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data?.settings?.backgroundUrl) setCurrentBg(data.settings.backgroundUrl);
                if (typeof data?.settings?.backgroundOpacity === 'number') setBgOpacity(data.settings.backgroundOpacity);
            })
            .catch(() => {});
    }, []);

    async function handleOpacitySave() {
        setBgSaving(true);
        setBgMsg('');
        try {
            await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backgroundOpacity: bgOpacity }),
            });
            setBgMsg('✓ Opacity saved');
        } catch {
            setBgMsg('✗ Failed to save opacity');
        } finally {
            setBgSaving(false);
        }
    }

    async function handleRemoveBg() {
        setBgSaving(true);
        setBgMsg('');
        try {
            await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backgroundUrl: '' }),
            });
            setCurrentBg('');
            setBgPreview('');
            setBgMsg('✓ Background removed');
        } catch {
            setBgMsg('✗ Failed to remove background');
        } finally {
            setBgSaving(false);
        }
    }

    const totalProjects = snippets.length;
    const recentProjects = snippets.slice(0, 5);

    return (
        <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        marginBottom: '0.5rem'
                    }}>
                        Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Manage your code projects
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link href="/" className="btn btn-ghost">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        View Site
                    </Link>
                    <Link href="/dashboard/cdn" className="btn btn-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        CDN Files
                    </Link>
                    <Link href="/dashboard/new" className="btn btn-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Project
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 'var(--spacing-lg)',
                marginBottom: '2rem'
            }}>
                <div className="glass-card-static" style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
                    borderColor: 'rgba(34, 197, 94, 0.2)'
                }}>
                    <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Total Projects
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        color: 'var(--accent-primary)',
                        fontFamily: 'var(--font-display)'
                    }}>
                        {totalProjects}
                    </div>
                </div>

                <div className="glass-card-static" style={{
                    background: 'linear-gradient(135deg, rgba(21, 128, 61, 0.15), rgba(21, 128, 61, 0.05))',
                    borderColor: 'rgba(21, 128, 61, 0.3)'
                }}>
                    <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Recent
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        color: 'var(--accent-secondary)',
                        fontFamily: 'var(--font-display)'
                    }}>
                        {recentProjects.length}
                    </div>
                </div>

                <div className="glass-card-static" style={{
                    background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(74, 222, 128, 0.05))',
                    borderColor: 'rgba(74, 222, 128, 0.2)'
                }}>
                    <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Status
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'var(--accent-success)',
                        fontFamily: 'var(--font-display)'
                    }}>
                        Active
                    </div>
                </div>
            </div>

            {/* Background Image Section */}
            <div className="glass-card-static" style={{ marginBottom: '2rem', padding: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '0.2rem' }}>
                            Site Background
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Visible to all visitors. Recommended: 1920×1080 or larger.
                        </p>
                    </div>
                    {currentBg && (
                        <button
                            onClick={handleRemoveBg}
                            disabled={bgSaving}
                            className="btn btn-ghost"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                            </svg>
                            Remove
                        </button>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Upload zone */}
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setBgPreview(URL.createObjectURL(file));
                                handleBgUpload(file);
                                e.target.value = '';
                            }}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={bgUploading}
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                border: '2px dashed var(--card-border)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--card-bg)',
                                cursor: bgUploading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'border-color var(--transition-fast)',
                                padding: '1.5rem',
                            }}
                            onMouseEnter={e => !bgUploading && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)')}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)')}
                        >
                            {bgUploading ? (
                                <>
                                    <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Uploading…</span>
                                </>
                            ) : (
                                <>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                        Click to upload image
                                    </span>
                                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>PNG, JPG, WEBP — max 8 MB</span>
                                </>
                            )}
                        </button>

                        {bgMsg && (
                            <p style={{
                                marginTop: '0.75rem',
                                fontSize: '0.875rem',
                                color: bgMsg.startsWith('✓') ? 'var(--accent-primary)' : '#f87171',
                                fontWeight: 500,
                            }}>
                                {bgMsg}
                            </p>
                        )}
                    </div>

                    {/* Preview + opacity */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Preview thumbnail */}
                        <div style={{
                            width: '100%',
                            height: '120px',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            border: '1px solid var(--card-border)',
                            background: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        }}>
                            {(bgPreview || currentBg) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={bgPreview || currentBg}
                                    alt="Background preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: bgPreview ? 0.6 : bgOpacity * 3 + 0.3 }}
                                />
                            ) : (
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>No background set</span>
                            )}
                            {currentBg && !bgPreview && (
                                <span style={{
                                    position: 'absolute', bottom: '6px', right: '8px',
                                    fontSize: '0.7rem', background: 'rgba(0,0,0,0.6)',
                                    color: '#fff', padding: '2px 6px', borderRadius: '4px',
                                }}>
                                    Active
                                </span>
                            )}
                        </div>

                        {/* Opacity slider */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    Opacity
                                </label>
                                <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                                    {Math.round(bgOpacity * 100)}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={bgOpacity}
                                onChange={e => setBgOpacity(parseFloat(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                            />
                            <button
                                onClick={handleOpacitySave}
                                disabled={bgSaving || !currentBg}
                                className="btn btn-secondary"
                                style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.875rem', padding: '0.5rem' }}
                            >
                                {bgSaving ? 'Saving…' : 'Save Opacity'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects Table/Cards */}
            <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                    padding: 'var(--spacing-lg)',
                    borderBottom: '1px solid var(--card-border)'
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-display)'
                    }}>
                        All Projects
                    </h2>
                </div>

                {snippets.length === 0 ? (
                    <div style={{
                        padding: '4rem 2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            No Projects Yet
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Create your first project to get started
                        </p>
                        <Link href="/dashboard/new" className="btn btn-primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Create Project
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="mobile-hidden" style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <tr>
                                        <th style={{
                                            padding: '1rem 1.5rem',
                                            textAlign: 'left',
                                            color: 'var(--text-secondary)',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            Title
                                        </th>

                                        <th style={{
                                            padding: '1rem 1.5rem',
                                            textAlign: 'left',
                                            color: 'var(--text-secondary)',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            Date
                                        </th>
                                        <th style={{
                                            padding: '1rem 1.5rem',
                                            textAlign: 'right',
                                            color: 'var(--text-secondary)',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {snippets.map((snip: any) => (
                                        <tr
                                            key={snip._id}
                                            style={{
                                                borderBottom: '1px solid var(--card-border)',
                                                transition: 'background var(--transition-fast)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                    {snip.title}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.875rem',
                                                    color: 'var(--text-secondary)',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {snip.description}
                                                </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem 1.5rem',
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.875rem'
                                            }}>
                                                {new Date(snip.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <Link
                                                        href={`/project/${snip._id}`}
                                                        className="btn-icon"
                                                        title="View"
                                                        style={{ padding: '0.5rem' }}
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                            <circle cx="12" cy="12" r="3"></circle>
                                                        </svg>
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/edit/${snip._id}`}
                                                        className="btn-icon"
                                                        title="Edit"
                                                        style={{ padding: '0.5rem' }}
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="desktop-hidden" style={{ padding: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {snippets.map((snip: any) => (
                                    <div
                                        key={snip._id}
                                        className="glass-card-static"
                                        style={{ padding: 'var(--spacing-md)' }}
                                    >
                                        <div style={{ marginBottom: '0.75rem' }}>
                                            <h3 style={{
                                                fontSize: '1.125rem',
                                                fontWeight: 600,
                                                marginBottom: '0.5rem'
                                            }}>
                                                {snip.title}
                                            </h3>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--text-secondary)',
                                                marginBottom: '0.75rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {snip.description}
                                            </p>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--text-tertiary)',
                                                marginBottom: '0.75rem'
                                            }}>
                                                {new Date(snip.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link
                                                href={`/project/${snip._id}`}
                                                className="btn btn-ghost"
                                                style={{ flex: 1, fontSize: '0.875rem', padding: '0.625rem' }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                                View
                                            </Link>
                                            <Link
                                                href={`/dashboard/edit/${snip._id}`}
                                                className="btn btn-secondary"
                                                style={{ flex: 1, fontSize: '0.875rem', padding: '0.625rem' }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
