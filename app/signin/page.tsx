'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'register';

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password !== confirm) { setError('Passwords do not match'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/account/login' : '/api/account/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      // Redirect to own profile after auth
      router.push(`/profile/${encodeURIComponent(data.username)}`);
      router.refresh();
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      {/* Back link */}
      <Link href="/" style={{
        position: 'absolute', top: '1.5rem', left: '1.5rem',
        color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to nova-browser
      </Link>

      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{
            fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)',
            background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>nova-browser</Link>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'var(--card-bg)',
          border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)',
          padding: '0.25rem', marginBottom: '1.5rem',
        }}>
          {(['login', 'register'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
              flex: 1, padding: '0.5rem', border: 'none', cursor: 'pointer',
              borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 600,
              background: mode === m ? 'var(--accent-gradient)' : 'transparent',
              color: mode === m ? '#05130a' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
            }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card-static" style={{
          display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem',
        }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your_username"
              required
              maxLength={32}
              autoFocus
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
          )}

          {error && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', marginTop: '0.25rem' }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: 0 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </form>

        {/* Staff login notice */}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '1.25rem' }}>
          Staff?{' '}
          <Link href="/login" style={{ color: 'var(--text-secondary)' }}>Staff portal →</Link>
        </p>
      </div>
    </main>
  );
}
