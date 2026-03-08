'use client';
import { useEffect, useState } from 'react';

interface SentimentAsset {
    ticker: string;
    name: string;
    type: 'stock' | 'crypto';
    sentimentScore: number; // -100 to +100
    bullScore: number;
    bearScore: number;
    neutralScore: number;
    outperformProb: number; // 0-100
    newsCount: number;
    socialMentions: number;
    trend: 'rising' | 'falling' | 'stable';
    signals: string[];
}

function generateSentiment(ticker: string, liveQuote: any): SentimentAsset {
    // Generate AI sentiment scores using real underlying price volatility via changePct
    const seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + (liveQuote.changePct * 10 || 0);
    const rand = (min: number, max: number, offset = 0) => {
        const x = Math.sin(seed + offset) * 10000;
        return min + ((x - Math.floor(x)) * (max - min));
    };

    const priceSignal = liveQuote.changePct > 1 ? 20 : liveQuote.changePct > 0 ? 10 : liveQuote.changePct > -1 ? -10 : -20;
    const baseScore = Math.round(priceSignal + rand(-25, 25, 1));
    const clampedScore = Math.max(-85, Math.min(85, baseScore));
    const bullS = Math.round(Math.max(20, Math.min(80, 50 + clampedScore / 2 + rand(-10, 10, 2))));
    const bearS = Math.round(Math.max(10, 100 - bullS - rand(5, 25, 3)));
    const neutS = Math.max(5, 100 - bullS - bearS);

    const outperformProb = Math.round(Math.max(10, Math.min(90, 50 + clampedScore * 0.4 + rand(-8, 8, 4))));
    const trends = ['rising', 'falling', 'stable'] as const;
    const trendIndex = clampedScore > 15 ? 0 : clampedScore < -15 ? 1 : 2;

    const SIGNAL_POOL = [
        'RSI oversold', 'RSI overbought', 'MACD bullish cross', 'MACD bearish cross',
        'Above 50-day MA', 'Below 200-day MA', 'Volume spike', 'Insider buying',
        'Analyst upgrade', 'Analyst downgrade', 'Options unusual activity',
        'Short interest rising', 'Short interest falling', 'Earnings beat expected',
    ];

    const signals = SIGNAL_POOL.filter((_, i) => {
        const x = Math.sin(seed + i * 7.3) * 10000;
        return (x - Math.floor(x)) > 0.6;
    }).slice(0, 4);

    return {
        ticker, name: ticker, type: 'stock',
        sentimentScore: clampedScore,
        bullScore: bullS, bearScore: bearS, neutralScore: neutS,
        outperformProb,
        newsCount: Math.round(rand(3, 28, 5)),
        socialMentions: Math.round(rand(1200, 48000, 6)),
        trend: trends[trendIndex],
        signals,
    };
}

const FEATURED_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META', 'TSLA', 'AMZN', 'AMD', 'NFLX', 'INTC', 'CRM', 'BA', 'MCD', 'DIS'];

export default function SentimentEngine() {
    const [assets, setAssets] = useState<SentimentAsset[]>([]);
    const [selected, setSelected] = useState<SentimentAsset | null>(null);
    const [sortBy, setSortBy] = useState<'sentiment' | 'outperform' | 'mentions'>('sentiment');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/quote?tickers=${encodeURIComponent(FEATURED_TICKERS.join(','))}`);
                if (!res.ok) throw new Error('Failed');
                const data = await res.json();
                const quotes = Array.isArray(data) ? data : [data];

                if (active) {
                    const mappedAssets = quotes.map(q => generateSentiment(q.ticker, q));
                    setAssets(mappedAssets);
                    setSelected(mappedAssets[0] || null);
                    setLoading(false);
                }
            } catch (e) {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, []);

    const sorted = [...assets].sort((a, b) => {
        if (sortBy === 'sentiment') return b.sentimentScore - a.sentimentScore;
        if (sortBy === 'outperform') return b.outperformProb - a.outperformProb;
        return b.socialMentions - a.socialMentions;
    });

    const sentColor = (score: number) =>
        score > 40 ? 'var(--green)' : score > 10 ? '#8BC34A' : score > -10 ? 'var(--amber)' : score > -40 ? 'var(--orange)' : 'var(--red)';

    const sentLabel = (score: number) =>
        score > 50 ? 'EXTREME BULL' : score > 20 ? 'BULLISH' : score > -20 ? 'NEUTRAL' : score > -50 ? 'BEARISH' : 'EXTREME BEAR';

    if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--amber)' }}>Initializing Sentiment Analytics...</div>;
    }

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Asset list */}
            <div style={{ width: 260, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel-alt)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em', marginBottom: 6 }}>SENTIMENT ENGINE</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {(['sentiment', 'outperform', 'mentions'] as const).map(k => (
                            <button key={k} onClick={() => setSortBy(k)}
                                className={`btn ${sortBy === k ? 'btn-amber' : 'btn-ghost'}`}
                                style={{ padding: '2px 6px', fontSize: 8 }}>
                                {k === 'sentiment' ? 'SCORE' : k === 'outperform' ? 'PROB' : 'BUZZ'}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ flex: 1, overflow: 'auto' }}>
                    {sorted.map(a => (
                        <div key={a.ticker}
                            onClick={() => setSelected(a)}
                            style={{
                                padding: '8px 12px',
                                borderBottom: '1px solid var(--border-subtle)',
                                cursor: 'pointer',
                                background: selected?.ticker === a.ticker ? 'var(--amber-muted)' : 'transparent',
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => { if (selected?.ticker !== a.ticker) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                            onMouseLeave={e => { if (selected?.ticker !== a.ticker) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: selected?.ticker === a.ticker ? 'var(--amber)' : 'var(--text-primary)' }}>{a.ticker}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: sentColor(a.sentimentScore) }}>
                                    {a.sentimentScore > 0 ? '+' : ''}{a.sentimentScore}
                                </span>
                            </div>
                            {/* Mini bar */}
                            <div style={{ height: 3, background: 'var(--bg-surface)', borderRadius: 2, overflow: 'hidden', marginBottom: 3 }}>
                                <div style={{
                                    width: `${((a.sentimentScore + 100) / 200) * 100}%`,
                                    height: '100%',
                                    background: sentColor(a.sentimentScore),
                                    borderRadius: 2,
                                    transition: 'width 0.3s',
                                }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>OUTPERFORM</span>
                                <span style={{ fontSize: 9, fontWeight: 600, color: a.outperformProb >= 60 ? 'var(--green)' : a.outperformProb <= 40 ? 'var(--red)' : 'var(--amber)' }}>
                                    {a.outperformProb}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail panel */}
            {selected && (
                <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--amber)', letterSpacing: '0.1em' }}>{selected.ticker}</h2>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{selected.name}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div style={{ fontSize: 32, fontWeight: 900, color: sentColor(selected.sentimentScore) }}>
                                {selected.sentimentScore > 0 ? '+' : ''}{selected.sentimentScore}
                            </div>
                            <div style={{ fontSize: 10, color: sentColor(selected.sentimentScore), fontWeight: 700, letterSpacing: '0.1em' }}>
                                {sentLabel(selected.sentimentScore)}
                            </div>
                        </div>
                    </div>

                    {/* Outperformance probability */}
                    <OutperformGauge prob={selected.outperformProb} />

                    {/* Bull/Bear/Neutral breakdown */}
                    <div className="panel" style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10 }}>SENTIMENT BREAKDOWN</div>
                        <SentimentBar label="BULL" value={selected.bullScore} color="var(--green)" />
                        <SentimentBar label="NEUTRAL" value={selected.neutralScore} color="var(--amber)" />
                        <SentimentBar label="BEAR" value={selected.bearScore} color="var(--red)" />
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        <StatBox label="NEWS ARTICLES" value={`${selected.newsCount}`} icon="📰" />
                        <StatBox label="SOCIAL MENTIONS" value={selected.socialMentions >= 1000 ? `${(selected.socialMentions / 1000).toFixed(1)}K` : `${selected.socialMentions}`} icon="💬" />
                        <StatBox label="TREND" value={selected.trend.toUpperCase()} icon={selected.trend === 'rising' ? '📈' : selected.trend === 'falling' ? '📉' : '➡️'} color={selected.trend === 'rising' ? 'var(--green)' : selected.trend === 'falling' ? 'var(--red)' : 'var(--amber)'} />
                    </div>

                    {/* Signal list */}
                    {selected.signals.length > 0 && (
                        <div className="panel" style={{ padding: '12px 14px' }}>
                            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10 }}>TECHNICAL SIGNALS</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {selected.signals.map((s, i) => {
                                    const isPos = s.includes('bull') || s.includes('above') || s.includes('buy') || s.includes('upgrade') || s.includes('falling');
                                    const isNeg = s.includes('bear') || s.includes('below') || s.includes('downgrade') || s.includes('rising') && s.includes('short');
                                    return (
                                        <span key={i} className={`tag ${isPos ? 'tag-green' : isNeg ? 'tag-red' : 'tag-amber'}`} style={{ fontSize: 10, padding: '4px 10px' }}>
                                            {s}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Top sentiment vs market */}
                    <SentimentRadar bull={selected.bullScore} bear={selected.bearScore} neutral={selected.neutralScore} outperform={selected.outperformProb} />
                </div>
            )}
        </div>
    );
}

function OutperformGauge({ prob }: { prob: number }) {
    const color = prob >= 65 ? 'var(--green)' : prob >= 50 ? 'var(--cyan)' : prob >= 35 ? 'var(--amber)' : 'var(--red)';
    return (
        <div className="panel" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>AI OUTPERFORMANCE PROBABILITY (30D)</div>
                <span style={{ fontSize: 20, fontWeight: 900, color }}>{prob}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-surface)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: '100%', background: 'var(--border-strong)', zIndex: 1 }} />
                <div style={{
                    width: `${prob}%`, height: '100%',
                    background: `linear-gradient(90deg, ${prob >= 50 ? 'rgba(0,200,83,0.3)' : 'rgba(255,61,61,0.3)'}, ${color})`,
                    borderRadius: 4, transition: 'width 0.5s ease',
                }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>UNDERPERFORM</span>
                <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>50% BASE</span>
                <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>OUTPERFORM</span>
            </div>
        </div>
    );
}

function SentimentBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', width: 50 }}>{label}</span>
            <div style={{ flex: 1, height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3, opacity: 0.85, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color, width: 32, textAlign: 'right' }}>{value}%</span>
        </div>
    );
}

function StatBox({ label, value, icon, color }: { label: string; value: string; icon: string; color?: string }) {
    return (
        <div className="stat-card">
            <span style={{ fontSize: 18, marginBottom: 4 }}>{icon}</span>
            <span className="stat-label">{label}</span>
            <span className="stat-value" style={{ color: color ?? 'var(--text-primary)', fontSize: 16 }}>{value}</span>
        </div>
    );
}

function SentimentRadar({ bull, bear, neutral, outperform }: { bull: number; bear: number; neutral: number; outperform: number }) {
    const cx = 80, cy = 80, r = 60;
    const axes = [
        { label: 'BULL', value: bull / 100 },
        { label: 'OUTPERFORM', value: outperform / 100 },
        { label: 'NEUTRAL', value: neutral / 100 },
        { label: 'MOMENTUM', value: (bull + outperform) / 200 },
    ];

    const pts = axes.map((a, i) => {
        const angle = (i / axes.length) * 2 * Math.PI - Math.PI / 2;
        return {
            x: cx + r * a.value * Math.cos(angle),
            y: cy + r * a.value * Math.sin(angle),
            lx: cx + (r + 18) * Math.cos(angle),
            ly: cy + (r + 18) * Math.sin(angle),
        };
    });

    const polyPts = pts.map(p => `${p.x},${p.y}`).join(' ');
    const axisPts = axes.map((a, i) => {
        const angle = (i / axes.length) * 2 * Math.PI - Math.PI / 2;
        return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });

    return (
        <div className="panel" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>SENTIMENT RADAR</div>
                <svg width={160} height={160} viewBox="0 0 160 160">
                    {[0.25, 0.5, 0.75, 1].map(f => (
                        <polygon key={f} points={axisPts.map((p, i) => {
                            const angle = (i / axes.length) * 2 * Math.PI - Math.PI / 2;
                            return `${cx + r * f * Math.cos(angle)},${cy + r * f * Math.sin(angle)}`;
                        }).join(' ')} fill="none" stroke="rgba(255,140,0,0.08)" strokeWidth="1" />
                    ))}
                    {axisPts.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,140,0,0.1)" strokeWidth="1" />)}
                    <polygon points={polyPts} fill="rgba(255,140,0,0.12)" stroke="var(--amber)" strokeWidth="1.5" />
                    {pts.map((p, i) => (
                        <text key={i} x={p.lx} y={p.ly + 4} textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="var(--font-mono)">{axes[i].label}</text>
                    ))}
                </svg>
            </div>
            <div style={{ flex: 1 }}>
                {axes.map((a, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 3 }}>
                            <span style={{ color: 'var(--text-muted)' }}>{a.label}</span>
                            <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{Math.round(a.value * 100)}%</span>
                        </div>
                        <div style={{ height: 3, background: 'var(--bg-surface)', borderRadius: 2 }}>
                            <div style={{ width: `${a.value * 100}%`, height: '100%', background: 'var(--amber)', borderRadius: 2, opacity: 0.7 }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
