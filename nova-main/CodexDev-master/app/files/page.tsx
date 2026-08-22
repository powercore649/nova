'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FileItem {
    _id: string;
    filename: string;
    originalName: string;
    fileUrl: string;
    fileType: 'image' | 'zip';
    mimeType: string;
    fileSize: number;
    thumbnailUrl?: string;
    uploadedBy: string;
    downloads: number;
    createdAt: string;
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function FilesPage() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'zip'>('all');
    const [preview, setPreview] = useState<FileItem | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/files');
                if (!res.ok) throw new Error('Failed to load files');
                const data = await res.json();
                setFiles(data.files || []);
            } catch (e) {
                setError('Could not load files. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = files.filter((f) => {
        const matchesType = typeFilter === 'all' || f.fileType === typeFilter;
        const matchesSearch = f.originalName.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <main className="container" style={{ padding: '2.5rem 1.5rem', minHeight: '100vh' }}>
            <nav style={{ marginBottom: '2rem' }}>
                <Link href="/" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    &larr; Home
                </Link>
            </nav>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Files</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Browse images and archives uploaded to Nova-Browser.
            </p>

            {/* Controls */}
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}
            >
                <input
                    type="text"
                    placeholder="Search files..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '320px' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['all', 'image', 'zip'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={typeFilter === t ? 'btn btn-primary' : 'btn btn-secondary'}
                            style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                        >
                            {t === 'all' ? 'All' : t === 'image' ? 'Images' : 'Archives'}
                        </button>
                    ))}
                </div>
            </div>

            {/* States */}
            {loading && (
                <div className="grid grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: '220px' }} />
                    ))}
                </div>
            )}

            {!loading && error && (
                <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {files.length === 0 ? 'No files have been uploaded yet.' : 'No files match your search.'}
                    </p>
                </div>
            )}

            {/* Grid */}
            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-3">
                    {filtered.map((file) => (
                        <div key={file._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Thumbnail */}
                            <div
                                onClick={() => file.fileType === 'image' && setPreview(file)}
                                style={{
                                    width: '100%',
                                    height: '150px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-tertiary)',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    cursor: file.fileType === 'image' ? 'pointer' : 'default',
                                }}
                            >
                                {file.fileType === 'image' ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={file.thumbnailUrl || file.fileUrl}
                                        alt={file.originalName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '2.5rem' }}>🗜️</span>
                                )}
                            </div>

                            {/* Info */}
                            <p
                                title={file.originalName}
                                style={{
                                    fontWeight: 600,
                                    marginBottom: '0.35rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {file.originalName}
                            </p>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    marginBottom: '0.75rem',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <span className="badge badge-primary">{file.fileType}</span>
                                <span className="badge">{formatSize(file.fileSize)}</span>
                                <span className="badge">{formatDate(file.createdAt)}</span>
                            </div>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                                {file.downloads} download{file.downloads === 1 ? '' : 's'}
                            </p>

                            <a
                                href={`/api/files/${file._id}/download`}
                                download={file.originalName}
                                className="btn btn-secondary"
                                style={{ marginTop: 'auto', fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                            >
                                Download
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {preview && (
                <div
                    onClick={() => setPreview(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'var(--glass-blur-heavy)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        padding: '2rem',
                        cursor: 'zoom-out',
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={preview.fileUrl}
                        alt={preview.originalName}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '85vh',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    />
                </div>
            )}
        </main>
    );
}
