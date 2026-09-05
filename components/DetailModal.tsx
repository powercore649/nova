'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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

function getVoterKey(): string {
    if (typeof window === 'undefined') return '';
    let key = localStorage.getItem('nova-voter-key');
    if (!key) {
        key = `voter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem('nova-voter-key', key);
    }
    return key;
}

interface Comment {
    _id: string;
    username: string;
    text: string;
    createdAt: string;
}

// ── Interactions panel (comments + ratings + collections) ─────────────────────
function InteractionsPanel({ item }: { item: DetailItem }) {
    const targetType = item.kind === 'project' ? 'project' : 'file';
    const targetId = String(item._id);

    const [tab, setTab] = useState<'comments' | 'ratings' | 'collections'>('comments');

    // Comments
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentName, setCommentName] = useState('');
    const [commentPosting, setCommentPosting] = useState(false);
    const [commentMsg, setCommentMsg] = useState('');

    // Ratings
    const [avgRating, setAvgRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [myRating, setMyRating] = useState(0);
    const [ratingMsg, setRatingMsg] = useState('');

    // Collections
    const [collections, setCollections] = useState<any[]>([]);
    const [collectionsLoading, setCollectionsLoading] = useState(false);
    const [newColName, setNewColName] = useState('');
    const [newColDesc, setNewColDesc] = useState('');
    const [newColAuthor, setNewColAuthor] = useState('');
    const [colMsg, setColMsg] = useState('');

    useEffect(() => {
        fetch(`/api/ratings?targetType=${targetType}&targetId=${targetId}`)
            .then(r => r.json())
            .then(d => { setAvgRating(d.avg ?? 0); setRatingCount(d.count ?? 0); })
            .catch(() => {});
        const saved = localStorage.getItem(`nova-rating-${targetId}`);
        if (saved) setMyRating(parseInt(saved));
    }, [targetId, targetType]);

    useEffect(() => {
        if (tab !== 'comments') return;
        setCommentsLoading(true);
        fetch(`/api/comments?targetType=${targetType}&targetId=${targetId}`)
            .then(r => r.json())
            .then(d => { setComments(d.comments || []); setCommentsLoading(false); })
            .catch(() => setCommentsLoading(false));
    }, [tab, targetId, targetType]);

    useEffect(() => {
        if (tab !== 'collections') return;
        setCollectionsLoading(true);
        fetch('/api/collections')
            .then(r => r.json())
            .then(d => { setCollections(d.collections || []); setCollectionsLoading(false); })
            .catch(() => setCollectionsLoading(false));
    }, [tab]);

    async function submitComment() {
        if (!commentText.trim()) return;
        setCommentPosting(true);
        setCommentMsg('');
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetType,
                    targetId,
                    text: commentText.trim(),
                    username: commentName.trim() || 'Anonymous',
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.details || data.error || 'Failed');
            setComments(prev => [data.comment, ...prev]);
            setCommentText('');
            setCommentMsg('✓ Comment posted');
            setTimeout(() => setCommentMsg(''), 3000);
        } catch (e: any) {
            setCommentMsg(`✗ ${e.message}`);
        } finally {
            setCommentPosting(false);
        }
    }

    async function submitRating(score: number) {
        setMyRating(score);
        localStorage.setItem(`nova-rating-${targetId}`, String(score));
        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetType, targetId, score, voterKey: getVoterKey() }),
            });
            const data = await res.json();
            if (res.ok) { setAvgRating(data.avg); setRatingCount(data.count); setRatingMsg('✓ Saved'); setTimeout(() => setRatingMsg(''), 2500); }
        } catch { setRatingMsg('✗ Failed'); }
    }

    async function addToCollection(colId: string) {
        const res = await fetch(`/api/collections/${colId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add', projectId: targetId }),
        });
        setColMsg(res.ok ? '✓ Added' : '✗ Failed');
        setTimeout(() => setColMsg(''), 2500);
    }

    async function createCollection() {
        if (!newColName.trim()) return;
        const res = await fetch('/api/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newColName.trim(), description: newColDesc.trim(), username: newColAuthor.trim() || 'Anonymous', projectIds: [targetId] }),
        });
        const data = await res.json();
        if (res.ok) {
            setCollections(prev => [data.collection, ...prev]);
            setNewColName(''); setNewColDesc(''); setNewColAuthor('');
            setColMsg('✓ Collection created');
        } else {
            setColMsg('✗ Failed');
        }
        setTimeout(() => setColMsg(''), 2500);
    }

    const displayStars = hoveredStar || myRating;

    return (
        <div style={{ borderTop: '1px solid var(--card-border)', marginTop: '1.25rem', paddingTop: '1rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                {(['comments', 'ratings', 'collections'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        flex: 1, padding: '0.5rem 0.25rem', border: 'none',
                        background: tab === t ? 'rgba(34,197,94,0.1)' : 'transparent',
                        color: tab === t ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: tab === t ? 600 : 400,
                        borderBottom: `2px solid ${tab === t ? 'var(--accent-primary)' : 'transparent'}`,
                        cursor: 'pointer', fontSize: '0.78rem', borderRadius: '4px 4px 0 0',
                        transition: 'all 150ms',
                    }}>
                        {t === 'comments' ? `💬 Comments${comments.length > 0 ? ` (${comments.length})` : ''}` : t === 'ratings' ? `⭐ Rate` : '📚 Save'}
                    </button>
                ))}
            </div>

            {/* Comments */}
            {tab === 'comments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <input placeholder="Your name (optional)" value={commentName} onChange={e => setCommentName(e.target.value)} maxLength={32}
                        style={{ padding: '0.45rem 0.7rem', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', outline: 'none' }}/>
                    <textarea placeholder="Leave a comment…" value={commentText} onChange={e => setCommentText(e.target.value)} maxLength={1000} rows={2}
                        style={{ padding: '0.45rem 0.7rem', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', resize: 'none', fontFamily: 'inherit', outline: 'none' }}/>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: commentMsg.startsWith('✓') ? 'var(--accent-primary)' : '#f87171' }}>{commentMsg}</span>
                        <button onClick={submitComment} disabled={commentPosting || !commentText.trim()}
                            style={{ padding: '0.35rem 0.8rem', background: 'var(--accent-gradient)', border: 'none', borderRadius: '6px', color: '#05130a', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', opacity: !commentText.trim() ? 0.5 : 1 }}>
                            {commentPosting ? '…' : 'Post'}
                        </button>
                    </div>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                        {commentsLoading ? <div className="skeleton" style={{ height: '40px', borderRadius: '6px' }}/> :
                         comments.length === 0 ? <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', textAlign: 'center', padding: '0.5rem 0' }}>No comments yet.</p> :
                         comments.map(c => (
                            <div key={c._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '0.5rem 0.7rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{c.username}</span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{c.text}</p>
                            </div>
                         ))
                        }
                    </div>
                </div>
            )}

            {/* Ratings */}
            {tab === 'ratings' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
                            {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                        </div>
                        <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center', margin: '0.2rem 0' }}>
                            {[1,2,3,4,5].map(s => (
                                <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= Math.round(avgRating) ? '#fbbf24' : 'none'} stroke="#fbbf24" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                            ))}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Your rating:</p>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                            {[1,2,3,4,5].map(s => (
                                <button key={s} onMouseEnter={() => setHoveredStar(s)} onMouseLeave={() => setHoveredStar(0)} onClick={() => submitRating(s)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill={s <= displayStars ? '#fbbf24' : 'none'} stroke="#fbbf24" strokeWidth="2"
                                        style={{ transition: 'all 100ms', transform: s <= displayStars ? 'scale(1.15)' : 'scale(1)' }}>
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                </button>
                            ))}
                        </div>
                        {ratingMsg && <p style={{ fontSize: '0.78rem', color: ratingMsg.startsWith('✓') ? 'var(--accent-primary)' : '#f87171', marginTop: '0.3rem' }}>{ratingMsg}</p>}
                        {myRating > 0 && <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>You rated: {myRating}/5</p>}
                    </div>
                </div>
            )}

            {/* Collections */}
            {tab === 'collections' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {colMsg && <p style={{ fontSize: '0.8rem', color: colMsg.startsWith('✓') ? 'var(--accent-primary)' : '#f87171', margin: 0 }}>{colMsg}</p>}
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Create new</p>
                        <input placeholder="Name *" value={newColName} onChange={e => setNewColName(e.target.value)} maxLength={100}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', outline: 'none' }}/>
                        <input placeholder="Your name (optional)" value={newColAuthor} onChange={e => setNewColAuthor(e.target.value)} maxLength={32}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', outline: 'none' }}/>
                        <button onClick={createCollection} disabled={!newColName.trim()}
                            style={{ padding: '0.35rem', background: 'var(--accent-gradient)', border: 'none', borderRadius: '6px', color: '#05130a', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', opacity: !newColName.trim() ? 0.5 : 1 }}>
                            Create & save this file
                        </button>
                    </div>
                    {collectionsLoading ? <div className="skeleton" style={{ height: '40px', borderRadius: '6px' }}/> :
                     collections.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '150px', overflowY: 'auto' }}>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', margin: 0 }}>Add to existing:</p>
                            {collections.slice(0, 8).map(col => (
                                <div key={col._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '0.35rem 0.6rem' }}>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{col.name}</span>
                                    <button onClick={() => addToCollection(col._id)}
                                        style={{ padding: '0.2rem 0.5rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', color: 'var(--accent-primary)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>
                                        + Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main modal ────────────────────────────────────────────────────────────────
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

                {/* Interactions — comments, ratings, collections for both projects and files */}
                <InteractionsPanel item={item} />
            </div>
        </div>
    );
}
