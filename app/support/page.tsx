'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SupportPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [error, setError] = useState('');
    const [ticketId, setTicketId] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setStatus('loading');

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setTicketId(data.ticketId || '');
            } else {
                setStatus('idle');
                setError(data.error || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setStatus('idle');
            setError('Connection error. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <main className="container" style={{ padding: '4rem 1.5rem', minHeight: '100vh', maxWidth: '600px' }}>
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Ticket Submitted</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                        Thanks for reaching out. We've received your ticket and will get back to you at the
                        email address you provided.
                    </p>
                    {ticketId && (
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '2rem' }}>
                            Reference ID: <code style={{ color: 'var(--accent-primary)' }}>{ticketId}</code>
                        </p>
                    )}
                    <Link href="/" className="btn btn-primary">
                        Back to Home
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="container" style={{ padding: '2.5rem 1.5rem', minHeight: '100vh', maxWidth: '600px' }}>
            <nav style={{ marginBottom: '2rem' }}>
                <Link href="/" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    &larr; Home
                </Link>
            </nav>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Support</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Found a bug, have a question, or need help with your account? Send us a ticket below.
            </p>

            {error && (
                <div
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        fontSize: '0.9rem',
                    }}
                >
                    ⚠ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            required
                            disabled={status === 'loading'}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            disabled={status === 'loading'}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Subject
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="What's this about?"
                        required
                        disabled={status === 'loading'}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your issue or question..."
                        rows={6}
                        required
                        disabled={status === 'loading'}
                        style={{ resize: 'vertical' }}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={status === 'loading'}
                    style={{ opacity: status === 'loading' ? 0.7 : 1, cursor: status === 'loading' ? 'wait' : 'pointer' }}
                >
                    {status === 'loading' ? 'Sending...' : 'Submit Ticket'}
                </button>
            </form>
        </main>
    );
}
