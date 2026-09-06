'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from '@/lib/useAccount';

interface Comment {
  _id: string;
  username: string;
  text: string;
  createdAt: string;
}

interface Props {
  projectId: string;
  projectTitle: string;
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

export default function ProjectInteractions({ projectId, projectTitle }: Props) {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'comments' | 'ratings' | 'collections'>('comments');

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
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
  const [colMsg, setColMsg] = useState('');

  // Load ratings on mount
  useEffect(() => {
    fetch(`/api/ratings?targetType=project&targetId=${projectId}`)
      .then(r => r.json())
      .then(d => { setAvgRating(d.avg); setRatingCount(d.count); })
      .catch(() => {});
    const saved = localStorage.getItem(`nova-rating-${projectId}`);
    if (saved) setMyRating(parseInt(saved));
  }, [projectId]);

  // Load comments when panel opens on comments tab
  useEffect(() => {
    if (!open || tab !== 'comments') return;
    setCommentsLoading(true);
    fetch(`/api/comments?targetType=project&targetId=${projectId}`)
      .then(r => r.json())
      .then(d => { setComments(d.comments || []); setCommentsLoading(false); })
      .catch(() => setCommentsLoading(false));
  }, [open, tab, projectId]);

  // Load collections when panel opens on collections tab
  useEffect(() => {
    if (!open || tab !== 'collections') return;
    setCollectionsLoading(true);
    fetch('/api/collections')
      .then(r => r.json())
      .then(d => { setCollections(d.collections || []); setCollectionsLoading(false); })
      .catch(() => setCollectionsLoading(false));
  }, [open, tab, projectId]);

  async function submitComment() {
    if (!commentText.trim()) return;
    setCommentPosting(true);
    setCommentMsg('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'project',
          targetId: projectId,
          text: commentText.trim(),
          username: account?.username || 'Anonymous',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComments(prev => [data.comment, ...prev]);
      setCommentText('');
      setCommentMsg('✓ Comment posted');
      setTimeout(() => setCommentMsg(''), 3000);
    } catch (e: any) {
      setCommentMsg(`✗ ${e.message || 'Failed to post'}`);
    } finally {
      setCommentPosting(false);
    }
  }

  async function submitRating(score: number) {
    setMyRating(score);
    localStorage.setItem(`nova-rating-${projectId}`, String(score));
    setRatingMsg('');
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'project',
          targetId: projectId,
          score,
          voterKey: getVoterKey(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvgRating(data.avg);
      setRatingCount(data.count);
      setRatingMsg('✓ Rating saved');
      setTimeout(() => setRatingMsg(''), 3000);
    } catch {
      setRatingMsg('✗ Failed to save');
    }
  }

  async function addToCollection(collectionId: string) {
    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', projectId }),
      });
      if (res.ok) {
        setColMsg('✓ Added to collection');
        setTimeout(() => setColMsg(''), 3000);
      }
    } catch {
      setColMsg('✗ Failed');
    }
  }

  async function createCollection() {
    if (!newColName.trim()) return;
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newColName.trim(),
          description: newColDesc.trim(),
          username: account?.username || 'Anonymous',
          projectIds: [projectId],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCollections(prev => [data.collection, ...prev]);
      setNewColName('');
      setNewColDesc('');
      setColMsg('✓ Collection created with this project');
      setTimeout(() => setColMsg(''), 3000);
    } catch (e: any) {
      setColMsg(`✗ ${e.message || 'Failed'}`);
    }
  }

  const displayStars = hoveredStar || myRating;

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger bar */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {/* Inline avg rating display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.5rem' }}>
          {[1,2,3,4,5].map(s => (
            <svg key={s} width="14" height="14" viewBox="0 0 24 24"
              fill={s <= Math.round(avgRating) ? '#fbbf24' : 'none'}
              stroke="#fbbf24" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
          {ratingCount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>({ratingCount})</span>}
        </div>

        <button
          onClick={() => setOpen(!open)}
          style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-md)', padding: '0.375rem 0.75rem',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            transition: 'all 150ms ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {comments.length > 0 ? comments.length : ''} Comments
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0,
          width: 'min(420px, 95vw)',
          background: '#0d100d',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 500,
          marginTop: '0.5rem',
          overflow: 'hidden',
          animation: 'slideDown 0.2s ease-out',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)' }}>
            {(['comments', 'ratings', 'collections'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '0.75rem', border: 'none',
                background: tab === t ? 'rgba(34,197,94,0.08)' : 'transparent',
                color: tab === t ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: tab === t ? 600 : 400,
                borderBottom: tab === t ? '2px solid var(--accent-primary)' : '2px solid transparent',
                cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize',
                transition: 'all 150ms',
              }}>
                {t === 'comments' ? '💬 Comments' : t === 'ratings' ? '⭐ Rate' : '📚 Save'}
              </button>
            ))}
          </div>

          <div style={{ padding: '1rem', maxHeight: '420px', overflowY: 'auto' }}>

            {/* ── Comments ── */}
            {tab === 'comments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Post form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Show who is commenting */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.6rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#05130a', flexShrink: 0 }}>
                      {(account?.username || 'A').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: account ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
                      {account ? account.username : 'Anonymous — sign in to link your profile'}
                    </span>
                    {!account && (
                      <a href="/signin" style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Sign in →</a>
                    )}
                  </div>
                  <textarea
                    placeholder="Leave a comment…"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', resize: 'none', fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {commentMsg && <span style={{ fontSize: '0.8rem', color: commentMsg.startsWith('✓') ? 'var(--accent-primary)' : '#f87171' }}>{commentMsg}</span>}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{commentText.length}/1000</span>
                    <button
                      onClick={submitComment}
                      disabled={commentPosting || !commentText.trim()}
                      style={{
                        marginLeft: '0.5rem', padding: '0.4rem 0.9rem',
                        background: 'var(--accent-gradient)', border: 'none',
                        borderRadius: 'var(--radius-sm)', color: '#05130a',
                        fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                        opacity: !commentText.trim() ? 0.5 : 1,
                      }}
                    >
                      {commentPosting ? '…' : 'Post'}
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '0.75rem' }}>
                  {commentsLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[1,2].map(i => <div key={i} className="skeleton" style={{ height: '52px', borderRadius: 'var(--radius-sm)' }}/>)}
                    </div>
                  ) : comments.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                      No comments yet. Be the first!
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {comments.map(c => (
                        <div key={c._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{c.username}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                              {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Ratings ── */}
            {tab === 'ratings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '0.5rem 0' }}>
                {/* Avg display */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
                    {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', marginBottom: '0.25rem' }}>
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="20" height="20" viewBox="0 0 24 24"
                        fill={s <= Math.round(avgRating) ? '#fbbf24' : 'none'}
                        stroke="#fbbf24" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
                  </span>
                </div>

                {/* Rate input */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your rating:</p>
                  <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s}
                        onMouseEnter={() => setHoveredStar(s)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => submitRating(s)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem' }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24"
                          fill={s <= displayStars ? '#fbbf24' : 'none'}
                          stroke="#fbbf24" strokeWidth="2"
                          style={{ transition: 'all 100ms', transform: s <= displayStars ? 'scale(1.15)' : 'scale(1)' }}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                  {ratingMsg && <p style={{ fontSize: '0.8rem', color: ratingMsg.startsWith('✓') ? 'var(--accent-primary)' : '#f87171', marginTop: '0.5rem' }}>{ratingMsg}</p>}
                  {myRating > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>You rated: {myRating}/5</p>}
                </div>
              </div>
            )}

            {/* ── Collections ── */}
            {tab === 'collections' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {colMsg && <p style={{ fontSize: '0.8rem', color: colMsg.startsWith('✓') ? 'var(--accent-primary)' : '#f87171', margin: 0 }}>{colMsg}</p>}

                {/* Create new */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Create new collection</p>
                  <input placeholder="Collection name *" value={newColName} onChange={e => setNewColName(e.target.value)} maxLength={100}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}/>
                  <input placeholder="Description (optional)" value={newColDesc} onChange={e => setNewColDesc(e.target.value)} maxLength={500}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}/>
                  {account && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', padding: '0.2rem 0.1rem' }}>
                      Saved as <strong style={{ color: 'var(--accent-primary)' }}>{account.username}</strong>
                    </div>
                  )}
                  <button onClick={createCollection} disabled={!newColName.trim()}
                    style={{ padding: '0.4rem', background: 'var(--accent-gradient)', border: 'none', borderRadius: '6px', color: '#05130a', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', opacity: !newColName.trim() ? 0.5 : 1 }}>
                    Create & add this project
                  </button>
                </div>

                {/* Existing collections */}
                {collectionsLoading ? (
                  <div className="skeleton" style={{ height: '60px', borderRadius: 'var(--radius-sm)' }}/>
                ) : collections.length === 0 ? (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', textAlign: 'center' }}>No collections yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>Or add to existing:</p>
                    {collections.slice(0, 8).map(col => (
                      <div key={col._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '0.4rem 0.6rem' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{col.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginLeft: '0.4rem' }}>by {col.username}</span>
                        </div>
                        <button onClick={() => addToCollection(col._id)}
                          style={{ padding: '0.25rem 0.6rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
