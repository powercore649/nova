'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import DetailModal, { DetailItem } from '@/components/DetailModal';
import Navbar from '@/components/Navbar';
interface FileItem {
    _id: string;
    filename: string;
    originalName: string;
    fileUrl: string;
    fileType: 'image' | 'zip';
    mimeType: string;
    fileSize: number;
    thumbnailUrl?: string;
    youtubeUrl?: string;
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
    const [detail, setDetail] = useState<FileItem | null>(null);

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
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div className="container" style={{ padding: '2rem 1.5rem', flex: 1 }}>

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
                        <div
                            key={file._id}
                            className="glass-card"
                            style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                            onClick={() => setDetail(file)}
                        >
                            {/* Thumbnail */}
                            <div
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

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                <Link
                                    href={`/files/${file._id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="btn btn-ghost"
                                    style={{ fontSize: '0.85rem', padding: '0.6rem 1rem', flex: 1, justifyContent: 'center' }}
                                >
                                    View →
                                </Link>
                                <a
                                    href={`/api/files/${file._id}/download`}
                                    download={file.originalName}
                                    onClick={(e) => e.stopPropagation()}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="7 10 12 15 17 10"/>
                                        <line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {detail && (
                <DetailModal
                    item={{ ...detail, kind: 'file' } as DetailItem}
                    onClose={() => setDetail(null)}
                />
            )}
            </div>
        </main>
    );
}
