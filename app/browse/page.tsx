'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DetailModal, { DetailItem } from '@/components/DetailModal';

interface BrowseItem {
    _id: string;
    kind: 'project' | 'file';
    createdAt: string;
    title?: string;
    description?: string;
    language?: string;
    tags?: string[];
    downloadUrl?: string;
    originalName?: string;
    fileType?: 'image' | 'zip';
    fileUrl?: string;
    thumbnailUrl?: string;
    fileSize?: number;
    youtubeUrl?: string;
}

function formatSize(bytes?: number) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BrowsePage() {
    const [items, setItems] = useState<BrowseItem[]>([]);
    const [filtered, setFiltered] = useState<BrowseItem[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
    const [typeFilter, setTypeFilter] = useState<'all' | 'project' | 'file'>('all');
    const [detail, setDetail] = useState<BrowseItem | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    function copyLink(id: string) {
        const url = `${window.location.origin}/project/${id}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1800);
        });
    }

    useEffect(() => {
        Promise.all([
            fetch('/api/snippets').then(res => res.json()).catch(() => ({ snippets: [] })),
            fetch('/api/files').then(res => res.json()).catch(() => ({ files: [] })),
        ]).then(([snippetsData, filesData]) => {
            const projects: BrowseItem[] = (snippetsData.snippets || []).map((s: any) => ({
                ...s,
                kind: 'project' as const,
            }));
            const files: BrowseItem[] = (filesData.files || []).map((f: any) => ({
                ...f,
                kind: 'file' as const,
            }));

            const merged = [...projects, ...files].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setItems(merged);
            setFiltered(merged);

            const languages = Array.from(new Set(
                projects.map((s) => s.language).filter(Boolean)
            )) as string[];
            setAvailableLanguages(languages);

            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!items.length) return;
        const lowerSearch = search.toLowerCase();
        const result = items.filter((item) => {
            const label = item.kind === 'project' ? item.title : item.originalName;
            const matchesSearch = !search ||
                label?.toLowerCase().includes(lowerSearch) ||
                item.description?.toLowerCase().includes(lowerSearch) ||
                item.tags?.some((t) => t.toLowerCase().includes(lowerSearch)) ||
                item.language?.toLowerCase().includes(lowerSearch);

            const matchesLanguage = !selectedLanguage || item.language === selectedLanguage;
            const matchesType = typeFilter === 'all' || item.kind === typeFilter;

            return matchesSearch && matchesLanguage && matchesType;
        });
        setFiltered(result);
    }, [search, items, selectedLanguage, typeFilter]);

    return (
        <main style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Header */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div>
                        <Link
                            href="/"
                            className="btn btn-ghost"
                            style={{
                                padding: '0.5rem 1rem',
                                marginBottom: '1rem',
                                display: 'inline-flex'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            Back
                        </Link>
                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 800,
                            marginBottom: '0.5rem'
                        }}>
                            Browse <span className="gradient-text">Library</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                            Explore {items.length} premium projects and files
                        </p>
                    </div>
                </div>

                {/* Type filter */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {(['all', 'project', 'file'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={typeFilter === t ? 'btn btn-primary' : 'btn btn-ghost'}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                            {t === 'all' ? 'All' : t === 'project' ? 'Projects' : 'Files'}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title, language, tags, or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 3rem 1rem 3rem',
                            fontSize: '1rem',
                            background: 'var(--card-bg)',
                            border: '1px solid var(--card-border)',
                            borderRadius: 'var(--radius-lg)',
                            color: 'var(--text-primary)',
                            transition: 'all var(--transition-base)',
                            outline: 'none'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--accent-primary)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--card-border)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color var(--transition-fast)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="container">
                {loading ? (
                    <div className="grid grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="glass-card-static">
                                <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '1rem' }}></div>
                                <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '0.5rem' }}></div>
                                <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '1rem' }}></div>
                                <div className="skeleton" style={{ height: '36px', width: '120px' }}></div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card" style={{
                        textAlign: 'center',
                        padding: '4rem 2rem'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            No Results Found
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            {search ? `No results for "${search}"` : 'Try adjusting your filters'}
                        </p>
                        {(search || selectedLanguage || typeFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setSelectedLanguage(null);
                                    setTypeFilter('all');
                                }}
                                className="btn btn-primary"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div style={{
                            marginBottom: '1.5rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem'
                        }}>
                            Showing {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                        </div>
                        <div className="grid grid-cols-3 animate-fadeIn">
                            {filtered.map((item, index) => (
                                <div
                                    key={item._id}
                                    className="glass-card"
                                    onClick={() => setDetail(item)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        animationDelay: `${index * 0.05}s`,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span className="badge" style={{ fontSize: '0.7rem' }}>
                                            {item.kind === 'project' ? (item.language || 'project') : item.fileType}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        marginBottom: '0.75rem',
                                        fontWeight: 600,
                                        lineHeight: 1.3,
                                    }}>
                                        {item.kind === 'project' ? item.title : item.originalName}
                                    </h3>

                                    {item.kind === 'project' ? (
                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.9rem',
                                            marginBottom: '1.5rem',
                                            lineHeight: 1.6,
                                            flex: 1,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}>
                                            {item.description}
                                        </p>
                                    ) : (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                                            {formatSize(item.fileSize)}
                                        </p>
                                    )}

                                    {item.kind === 'project' && item.tags && item.tags.length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                            {item.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="badge" style={{ fontSize: '0.7rem' }}>{tag}</span>
                                            ))}
                                            {item.tags.length > 3 && (
                                                <span className="badge" style={{ fontSize: '0.7rem' }}>+{item.tags.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {item.kind === 'project' ? (
                                            <>
                                                <Link
                                                    href={`/project/${item._id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="btn btn-ghost"
                                                    style={{ padding: '0.625rem 1rem', fontSize: '0.875rem', flex: 1, justifyContent: 'center' }}
                                                >
                                                    View Project
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                                        <polyline points="12 5 19 12 12 19"></polyline>
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); copyLink(item._id); }}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem' }}
                                                    title="Copy link"
                                                >
                                                    {copiedId === item._id ? (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                                                            <polyline points="20 6 9 17 4 12"/>
                                                        </svg>
                                                    ) : (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                                        </svg>
                                                    )}
                                                </button>
                                                {item.downloadUrl && (
                                                    <a
                                                        href={item.downloadUrl}
                                                        download
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}
                                                        title="Download ZIP"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                            <polyline points="7 10 12 15 17 10"></polyline>
                                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                                        </svg>
                                                    </a>
                                                )}
                                            </>
                                        ) : (
                                            <a
                                                href={`/api/files/${item._id}/download`}
                                                download={item.originalName}
                                                onClick={(e) => e.stopPropagation()}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.625rem 1rem', fontSize: '0.875rem', flex: 1, textAlign: 'center' }}
                                            >
                                                Download
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {detail && (
                <DetailModal item={detail as DetailItem} onClose={() => setDetail(null)} />
            )}
        </main>
    );
}
