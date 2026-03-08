'use client';
import { useState, useEffect } from 'react';
import type { Article } from '@/app/api/news/route';

function timeAgo(dateStr: string) {
    const d = new Date(dateStr);
    const ms = Date.now() - d.getTime();
    const min = Math.floor(ms / 60000);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
}

export default function NewsDashboard() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/news')
            .then(res => res.json())
            .then(data => {
                setArticles(data);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                CONNECTING TO GLOBAL NEWS FEED...
            </div>
        );
    }

    if (!articles.length) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                NO NEWS DATA AVAILABLE
            </div>
        );
    }

    const featured = articles[0];
    const rest = articles.slice(1);

    return (
        <div style={{ height: '100%', overflow: 'auto', padding: 24, background: 'var(--bg-base)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 24 }}>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '0.05em', color: 'var(--amber)' }}>GLOBAL NEWS LIVE</h2>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.05em' }}>MOCK/YAHOO FINANCE RSS INTEGRATION</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', animation: 'pulse 2s infinite' }} />
                        FEED ACTIVE
                    </div>
                </div>

                {/* Featured Top Article */}
                {featured && (
                    <a href={featured.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <div className="panel" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginBottom: 24,
                            borderLeft: '4px solid var(--amber)',
                            overflow: 'hidden',
                            position: 'relative',
                            minHeight: 300,
                            padding: 0,
                        }}>
                            {featured.thumbnail && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundImage: `url(${featured.thumbnail})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    opacity: 0.3,
                                    zIndex: 0
                                }} />
                            )}
                            <div style={{
                                position: 'relative',
                                zIndex: 1,
                                background: 'linear-gradient(to top, var(--bg-surface) 0%, transparent 100%)',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                padding: 32
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    <span style={{ background: 'var(--amber)', color: '#000', padding: '4px 8px', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>TOP STORY</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{featured.publisher}</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(featured.publishedAt)}</span>
                                </div>
                                <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                    {featured.title}
                                </h1>
                                {featured.summary && (
                                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, maxWidth: 800, lineHeight: 1.5 }}>
                                        {featured.summary}
                                    </p>
                                )}
                            </div>
                        </div>
                    </a>
                )}

                {/* Grid of remaining articles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                    {rest.map(article => (
                        <a key={article.id} href={article.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="panel" style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, background 0.2s',
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.background = 'var(--bg-surface)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.05em' }}>{article.publisher}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(article.publishedAt)}</span>
                                </div>
                                <h3 style={{ fontSize: 16, margin: '0 0 12px 0', lineHeight: 1.4, fontWeight: 600 }}>
                                    {article.title}
                                </h3>
                                {article.thumbnail && (
                                    <div style={{
                                        marginTop: 'auto',
                                        height: 140,
                                        borderRadius: 4,
                                        backgroundImage: `url(${article.thumbnail})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        opacity: 0.8
                                    }} />
                                )}
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
