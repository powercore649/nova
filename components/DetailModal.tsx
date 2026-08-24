'use client';

import Link from 'next/link';

export interface DetailItem {
    _id: string;
    kind: 'project' | 'file';
    // project fields
    title?: string;
    description?: string;
    downloadUrl?: string;
    // file fields
    originalName?: string;
    fileType?: 'image' | 'zip';
    fileUrl?: string;
    thumbnailUrl?: string;
    fileSize?: number;
    // shared
    youtubeUrl?: string;
}

function formatSize(bytes?: number) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Accepts youtu.be/, watch?v=, or already-embed URLs and returns an embeddable URL, or null if invalid.
function toYoutubeEmbedUrl(raw?: string): string | null {
    if (!raw) return null;
    try {
        const url = new URL(raw);
        let videoId = '';
        if (url.hostname.includes('youtu.be')) {
            videoId = url.pathname.slice(1);
        } else if (url.pathname.startsWith('/embed/')) {
            return raw;
        } else {
            videoId = url.searchParams.get('v') || '';
        }
        if (!videoId) return null;
        return `https://www.youtube.com/embed/${videoId}`;
    } catch {
        return null;
    }
}

export default function DetailModal({ item, onClose }: { item: DetailItem; onClose: () => void }) {
    const isProject = item.kind === 'project';
    const displayTitle = isProject ? item.title : item.originalName;
    const embedUrl = toYoutubeEmbedUrl(item.youtubeUrl);

    const downloadHref = isProject
        ? item.downloadUrl
        : `/api/files/${item._id}/download`;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'var(--glass-blur-heavy, blur(12px))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 200,
                padding: '1.5rem',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: '560px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '1.75rem',
                    position: 'relative',
                }}
            >
                <button
                    onClick={onClose}
                    aria-label="Fermer"
                    className="btn btn-ghost"
                    style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem 0.6rem' }}
                >
                    ✕
                </button>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">{isProject ? 'project' : item.fileType}</span>
                    {!isProject && item.fileSize ? <span className="badge">{formatSize(item.fileSize)}</span> : null}
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', paddingRight: '2rem' }}>
                    {displayTitle}
                </h2>

                {isProject && item.description && (
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                        {item.description}
                    </p>
                )}

                {!isProject && item.fileType === 'image' && item.fileUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.fileUrl}
                        alt={displayTitle}
                        style={{ width: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', background: 'var(--bg-tertiary)' }}
                    />
                )}

                {/* Tutoriel YouTube */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                        📺 Tutoriel vidéo
                    </h3>
                    {embedUrl ? (
                        <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <iframe
                                src={embedUrl}
                                title="Tutoriel YouTube"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                            />
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                            Aucun tutoriel disponible pour le moment.
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {downloadHref && (
                        <a
                            href={downloadHref}
                            download
                            className="btn btn-primary"
                            style={{ flex: 1, justifyContent: 'center', padding: '0.75rem 1rem' }}
                        >
                            ⬇ Télécharger
                        </a>
                    )}
                    {isProject && (
                        <Link
                            href={`/project/${item._id}`}
                            className="btn btn-secondary"
                            style={{ flex: 1, justifyContent: 'center', padding: '0.75rem 1rem', textAlign: 'center' }}
                        >
                            Voir en direct →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
