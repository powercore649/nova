<<<<<<< HEAD
import Link from 'next/link';

export default function DocsPage() {
    return (
        <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh', maxWidth: '800px' }}>
            <nav style={{ marginBottom: '3rem' }}>
                <Link href="/" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>&larr; Home</Link>
            </nav>

            <article>
                <h1 style={{ fontSize: '3rem', marginBottom: '2rem', lineHeight: 1.1 }}>Documentation</h1>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Getting Started</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                        Codex CDN is a centralized repository for your organization's code, configurations, and reusable modules.
                        It is designed to facilitate easy sharing and discovery of technical assets.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'white' }}>For Developers</h2>
                    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Browsing Code</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Navigate to the <Link href="/browse" style={{ color: 'var(--accent-primary)' }}>Browse</Link> page to search for codes.
                            You can filter by language, tags, or keywords in the title.
                        </p>
                    </div>
                    <div className="glass-card">
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Using Code</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Click on any code card to view the full source. Use the "Copy" functionality (coming soon) or select the text to paste directly into your IDE.
                        </p>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'white' }}>For Staff</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                        Staff members have write access to the repository.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                            <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>1.</span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                Log in via the <Link href="/login" style={{ color: 'white', textDecoration: 'underline' }}>Staff Portal</Link>.
                            </span>
                        </li>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                            <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>2.</span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                Go to your Dashboard to manage existing projects.
                            </span>
                        </li>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                            <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>3.</span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                Click "New Project" to publish code. Supports standard syntax highlighting for JS, TS, Python, etc.
                            </span>
                        </li>
                    </ul>
                </section>
            </article>
=======
'use client';

import Link from 'next/link';
import { useState } from 'react';

type Section = {
    id: string;
    title: string;
    group: string;
};

const sections: Section[] = [
    { id: 'getting-started', title: 'Getting Started', group: 'Introduction' },
    { id: 'search', title: 'Search & Filters', group: 'Usage' },
    { id: 'browsing', title: 'Browsing the Library', group: 'Usage' },
    { id: 'using-code', title: 'Using the Code', group: 'Usage' },
    { id: 'account', title: 'Account & Login', group: 'Account' },
    { id: 'publishing', title: 'Publishing Content', group: 'Staff' },
    { id: 'tags', title: 'Tags & Languages', group: 'Staff' },
    { id: 'faq', title: 'FAQ', group: 'Help' },
];

const groups = Array.from(new Set(sections.map((s) => s.group)));

export default function DocsPage() {
    const [active, setActive] = useState('getting-started');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <main style={{ minHeight: '100vh' }}>
            {/* Top bar */}
            <div
                style={{
                    borderBottom: '1px solid var(--card-border)',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    background: 'rgba(10, 10, 10, 0.85)',
                    backdropFilter: 'var(--glass-blur)',
                    zIndex: 20,
                }}
            >
                <Link href="/" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    &larr; Home
                </Link>
                <button
                    onClick={() => setSidebarOpen((v) => !v)}
                    className="desktop-hidden btn-icon"
                    style={{ background: 'transparent' }}
                >
                    {sidebarOpen ? '✕' : '☰'}
                </button>
            </div>

            <div
                style={{
                    display: 'flex',
                    maxWidth: '1280px',
                    margin: '0 auto',
                    alignItems: 'flex-start',
                }}
            >
                {/* Sidebar */}
                <aside
                    style={{
                        width: '260px',
                        flexShrink: 0,
                        borderRight: '1px solid var(--card-border)',
                        padding: '2rem 1rem',
                        position: 'sticky',
                        top: '65px',
                        height: 'calc(100vh - 65px)',
                        overflowY: 'auto',
                        display: sidebarOpen ? 'block' : undefined,
                    }}
                    className={sidebarOpen ? '' : 'mobile-hidden'}
                >
                    {groups.map((group) => (
                        <div key={group} style={{ marginBottom: '1.75rem' }}>
                            <p
                                style={{
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: 'var(--text-tertiary)',
                                    fontWeight: 700,
                                    marginBottom: '0.5rem',
                                    paddingLeft: '0.75rem',
                                }}
                            >
                                {group}
                            </p>
                            {sections
                                .filter((s) => s.group === group)
                                .map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setActive(s.id);
                                            setSidebarOpen(false);
                                        }}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            marginBottom: '0.15rem',
                                            transition: 'all var(--transition-fast)',
                                            background:
                                                active === s.id ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                            color:
                                                active === s.id
                                                    ? 'var(--accent-primary)'
                                                    : 'var(--text-secondary)',
                                            fontWeight: active === s.id ? 600 : 400,
                                            borderLeft:
                                                active === s.id
                                                    ? '2px solid var(--accent-primary)'
                                                    : '2px solid transparent',
                                        }}
                                    >
                                        {s.title}
                                    </button>
                                ))}
                        </div>
                    ))}
                </aside>

                {/* Content */}
                <article style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '760px' }}>
                    {active === 'getting-started' && (
                        <section>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Getting Started</h1>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                Nova-Browser is a centralized repository for your code, configurations, and
                                reusable modules. It's built to make sharing and discovering technical
                                assets easy for a team or community.
                            </p>
                            <div className="glass-card" style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No account needed to read</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Anyone can browse and view published snippets — logging in is only
                                    required to publish or manage content.
                                </p>
                            </div>
                            <div className="glass-card">
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Where to start</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Check out the{' '}
                                    <button
                                        onClick={() => setActive('search')}
                                        style={{
                                            color: 'var(--accent-primary)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            font: 'inherit',
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        Search &amp; Filters
                                    </button>{' '}
                                    section to quickly find what you need.
                                </p>
                            </div>
                        </section>
                    )}

                    {active === 'search' && (
                        <section>
                            <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Search &amp; Filters</h1>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                The <Link href="/browse" style={{ color: 'var(--accent-primary)' }}>Browse</Link>{' '}
                                page lets you quickly find code by keyword, language, or tags.
                            </p>
                            <div className="glass-card" style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Keyword search</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    The search bar filters live across the title and description of each
                                    snippet. It's not case-sensitive.
                                </p>
                            </div>
                            <div className="glass-card" style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Filter by language</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Select a language from the filter to only show matching snippets
                                    (JavaScript, TypeScript, Python, etc.).
                                </p>
                            </div>
                            <div className="glass-card">
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Filter by tags</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Tags let you narrow results by topic (e.g. "api", "auth", "utils").
                                    Combine multiple tags for a more precise search.
                                </p>
                            </div>
                        </section>
                    )}

                    {active === 'browsing' && (
                        <section>
                            <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Browsing the Library</h1>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                The library shows the most recent projects first. Each card displays the
                                title, a short description, the language, and associated tags.
                            </p>
                            <div className="glass-card">
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Viewing a snippet</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Click on a card to open the full source view, with syntax highlighting.
                                </p>
                            </div>
                        </section>
                    )}

                    {active === 'using-code' && (
                        <section>
                            <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Using the Code</h1>
                            <div className="glass-card" style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Copying code</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Select the text directly from the code block, or use the quick-copy
                                    button if it's available on the snippet page.
                                </p>
                            </div>
                            <div className="glass-card">
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Downloading files</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Some projects offer downloadable files directly from their page.
                                </p>
                            </div>
                        </section>
                    )}

                    {active === 'account' && (
                        <section>
                            <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Account &amp; Login</h1>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                Write access (publishing, managing content) is reserved for staff members.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>1.</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        Head over to the{' '}
                                        <Link href="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                                            Staff Portal
                                        </Link>.
                                    </span>
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>2.</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        Log in with your staff credentials.
                                    </span>
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>3.</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        Head to your Dashboard to manage your published projects.
                                    </span>
                                </li>
                            </ul>
                        </section>
                    )}

                    {active === 'publishing' && (
                        <section>
                            <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Publishing Content</h1>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>1.</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        From the Dashboard, click "New Project".
                                    </span>
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>2.</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        Fill in the title, description, language, and source code.
                                    </span>
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>3.</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        Add relevant tags to make the project easier to discover.
                                    </span>
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>4.</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        Click "Publish Page" to put the project live.
                                    </span>
                                </li>
                            </ul>
                        </section>
                    )}

                    {active === 'tags' && (
                        <section>
                            <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Tags &amp; Languages</h1>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                A good tagging system makes the library much easier to explore.
                            </p>
                            <div className="glass-card" style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Best practices</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Use short, consistent tags (e.g. "api", "hooks", "auth") rather than
                                    long phrases. Separate them with commas.
                                </p>
                            </div>
                            <div className="glass-card">
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Supported languages</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Syntax highlighting covers JavaScript, TypeScript, Python, HTML, CSS,
                                    JSON, and Bash, among others.
                                </p>
                            </div>
                        </section>
                    )}

                    {active === 'faq' && (
                        <section>
                            <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>FAQ</h1>
                            <div className="glass-card" style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                    Can I view code without an account?
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Yes, reading is public. Only publishing requires staff access.
                                </p>
                            </div>
                            <div className="glass-card" style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                    How do I become a staff member?
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Staff access is granted by a site administrator.
                                </p>
                            </div>
                            <div className="glass-card">
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                    I found a mistake in a snippet I published, what do I do?
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    From your Dashboard, find the project and edit it directly.
                                </p>
                            </div>
                        </section>
                    )}
                </article>
            </div>
>>>>>>> 29aed2e9981bab3783c1bfffea7c7f06ccce60ec
        </main>
    );
}
