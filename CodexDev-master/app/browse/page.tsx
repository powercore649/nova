'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function BrowsePage() {
    const [activeTab, setActiveTab] = useState<'projects' | 'files'>('projects');

    // Projects (snippets) state
    const [snippets, setSnippets] = useState([]);
    const [filteredSnippets, setFilteredSnippets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

    // Files state
    const [files, setFiles] = useState<FileItem[]>([]);
    const [filesLoading, setFilesLoading] = useState(true);
    const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'image' | 'zip'>('all');
    const [preview, setPreview] = useState<FileItem | null>(null);

    const [search, setSearch] = useState('');

    useEffect(() => {
        // Fetch all snippets
        fetch('/api/snippets')
            .then(res => res.json())
            .then(data => {
                if (data.snippets) {
                    setSnippets(data.snippets);
                    setFilteredSnippets(data.snippets);

                    // Extract unique languages
                    const languages = Array.from(new Set(
                        data.snippets.map((s: any) => s.language).filter(Boolean)
                    )) as string[];
                    setAvailableLanguages(languages);
                }
                setLoading(false);
            })
            .catch(err => setLoading(false));

        // Fetch all files
        fetch('/api/files')
            .then(res => res.json())
            .then(data => {
                if (data.files) {
                    setFiles(data.files);
                }
                setFilesLoading(false);
            })
            .catch(err => setFilesLoading(false));
    }, []);

    useEffect(() => {
        if (!snippets.length) return;
        const lowerSearch = search.toLowerCase();
        const filtered = snippets.filter((s: any) => {
            const matchesSearch = !search ||
                s.title.toLowerCase().includes(lowerSearch) ||
                s.description.toLowerCase().includes(lowerSearch) ||
                s.tags?.some((t: string) => t.toLowerCase().includes(lowerSearch)) ||
                s.language?.toLowerCase().includes(lowerSearch);

            const matchesLanguage = !selectedLanguage || s.language === selectedLanguage;

            return matchesSearch && matchesLanguage;
        });
        setFilteredSnippets(filtered);
    }, [search, snippets, selectedLanguage]);

    const filteredFiles = files.filter((f) => {
        const matchesType = fileTypeFilter === 'all' || f.fileType === fileTypeFilter;
        const matchesSearch = !search || f.originalName.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

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
                            {activeTab === 'projects'
                                ? `Explore ${snippets.length} premium code projects`
                                : `Explore ${files.length} uploaded files`}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => { setActiveTab('projects'); setSearch(''); }}
                        className={activeTab === 'projects' ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                    >
                        Projects
                    </button>
                    <button
                        onClick={() => { setActiveTab('files'); setSearch(''); }}
                        className={activeTab === 'files' ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                    >
                        Files
                    </button>
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
                        placeholder={activeTab === 'projects' ? "Search by title, language, tags, or description..." : "Search files by name..."}
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

                {/* File type filter (Files tab only) */}
                {activeTab === 'files' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {(['all', 'image', 'zip'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setFileTypeFilter(t)}
                                className={fileTypeFilter === t ? 'btn btn-primary' : 'btn btn-secondary'}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                            >
                                {t === 'all' ? 'All' : t === 'image' ? 'Images' : 'Archives'}
                            </button>
                        ))}
                    </div>
                )}

                {/* Language filter (Projects tab only) */}
                {activeTab === 'projects' && availableLanguages.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setSelectedLanguage(null)}
                            className={!selectedLanguage ? 'btn btn-primary' : 'btn btn-secondary'}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        >
                            All
                        </button>
                        {availableLanguages.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={selectedLanguage === lang ? 'btn btn-primary' : 'btn btn-secondary'}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="container">
                {activeTab === 'projects' ? (
                    loading ? (
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
                    ) : filteredSnippets.length === 0 ? (
                        <div className="glass-card" style={{
                            textAlign: 'center',
                            padding: '4rem 2rem'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                No Projects Found
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                {search ? `No results for "${search}"` : 'Try adjusting your filters'}
                            </p>
                            {(search || selectedLanguage) && (
                                <button
                                    onClick={() => {
                                        setSearch('');
                                        setSelectedLanguage(null);
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
                                Showing {filteredSnippets.length} {filteredSnippets.length === 1 ? 'project' : 'projects'}
                            </div>
                            <div className="grid grid-cols-3 animate-fadeIn">
                                {filteredSnippets.map((snip: any, index: number) => (
                                    <div
                                        key={snip._id}
                                        className="glass-card"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            animationDelay: `${index * 0.05}s`
                                        }}
                                    >
                                        <div style={{ marginBottom: '1rem' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--text-tertiary)'
                                            }}>
                                                {new Date(snip.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <h3 style={{
                                            fontSize: '1.25rem',
                                            marginBottom: '0.75rem',
                                            fontWeight: 600,
                                            lineHeight: 1.3
                                        }}>
                                            {snip.title}
                                        </h3>

                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.9rem',
                                            marginBottom: '1.5rem',
                                            lineHeight: 1.6,
                                            flex: 1,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {snip.description}
                                        </p>

                                        {snip.tags && snip.tags.length > 0 && (
                                            <div style={{
                                                display: 'flex',
                                                gap: '0.5rem',
                                                flexWrap: 'wrap',
                                                marginBottom: '1rem'
                                            }}>
                                                {snip.tags.slice(0, 3).map((tag: string, i: number) => (
                                                    <span key={i} className="badge" style={{ fontSize: '0.7rem' }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                                {snip.tags.length > 3 && (
                                                    <span className="badge" style={{ fontSize: '0.7rem' }}>
                                                        +{snip.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}


                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link
                                                href={`/project/${snip._id}`}
                                                className="btn btn-ghost"
                                                style={{
                                                    padding: '0.625rem 1rem',
                                                    fontSize: '0.875rem',
                                                    flex: 1,
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                View Project
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                    <polyline points="12 5 19 12 12 19"></polyline>
                                                </svg>
                                            </Link>
                                            {snip.downloadUrl && (
                                                <a
                                                    href={snip.downloadUrl}
                                                    download
                                                    className="btn btn-secondary"
                                                    style={{
                                                        padding: '0.625rem 1rem',
                                                        fontSize: '0.875rem'
                                                    }}
                                                    title="Download ZIP"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                        <polyline points="7 10 12 15 17 10"></polyline>
                                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )
                ) : (
                    filesLoading ? (
                        <div className="grid grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="skeleton" style={{ height: '220px' }}></div>
                            ))}
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                No Files Found
                            </h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {search ? `No results for "${search}"` : 'No files have been uploaded yet.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Showing {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
                            </div>
                            <div className="grid grid-cols-3 animate-fadeIn">
                                {filteredFiles.map((file) => (
                                    <div key={file._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
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
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                            <span className="badge badge-primary">{file.fileType}</span>
                                            <span className="badge">{formatSize(file.fileSize)}</span>
                                        </div>

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
                        </>
                    )
                )}
            </div>

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
