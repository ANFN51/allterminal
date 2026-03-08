'use client';
import { useState, useEffect } from 'react';
import { fmt, fmtBig, fmtPct } from '@/lib/marketData';
import { EXCHANGES } from '@/lib/globalStocks';
import CandlestickChart from '../Charts/CandlestickChart';

interface ExchangeDashboardProps {
    exchangeCode: string;
    onBack: () => void;
    onSelectTicker: (t: string) => void;
    allStocks: any[]; // Using loosely typed array inherited from GlobalMarketsPanel LiveQuote integration
}

export default function ExchangeDashboard({ exchangeCode, onBack, onSelectTicker, allStocks }: ExchangeDashboardProps) {
    const exchangeMeta = EXCHANGES.find(e => e.code === exchangeCode);

    // Filter stocks for this exchange
    const exchangeStocks = allStocks.filter(s => s.exchange === exchangeCode || (exchangeMeta && s.countryCode === exchangeMeta.code));

    // Sort by market cap to find the "Top" stocks to act as our indices/leaders
    const sortedByCap = [...exchangeStocks].sort((a, b) => b.marketCap - a.marketCap);
    const leaders = sortedByCap.slice(0, 4);

    // Top movers (filter out zero prices to hide inactive listings)
    const validStocks = exchangeStocks.filter(s => s.price > 0);
    const topGainers = [...validStocks].sort((a, b) => b.changePct - a.changePct).slice(0, 5);
    const topLosers = [...validStocks].sort((a, b) => a.changePct - b.changePct).slice(0, 5);

    // Stats
    const advancing = validStocks.filter(s => s.changePct > 0).length;
    const declining = validStocks.filter(s => s.changePct < 0).length;
    const unchanged = validStocks.filter(s => s.changePct === 0).length;
    const totalCap = validStocks.reduce((sum, s) => sum + s.marketCap, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflow: 'auto', padding: 10 }}>
            {/* Header / Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px', background: 'var(--bg-panel-alt)', border: '1px solid var(--border)', borderRadius: 4, flexShrink: 0 }}>
                <button
                    onClick={onBack}
                    style={{ background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 14 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                    ←
                </button>
                <span style={{ fontSize: 24 }}>{exchangeMeta?.flag || '🏛'}</span>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.05em' }}>
                        {exchangeMeta?.name || exchangeCode} ({exchangeCode})
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {exchangeMeta?.country || 'Global'} · {exchangeStocks.length} Securities Listed
                    </div>
                </div>
            </div>

            {/* Leader Cards (acting like Indices) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 8,
            }}>
                {leaders.map(s => (
                    <LeaderCard
                        key={s.ticker}
                        ticker={s.ticker}
                        name={s.name}
                        price={s.price}
                        changePct={s.changePct}
                        currency={s.currency}
                        onClick={() => onSelectTicker(s.ticker)}
                    />
                ))}
                {leaders.length === 0 && (
                    <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
                        No data available for this exchange.
                    </div>
                )}
            </div>

            {/* Movers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1 }}>
                <MoverPanel title="TOP GAINERS" stocks={topGainers} color="var(--green)" onSelect={onSelectTicker} />
                <MoverPanel title="TOP LOSERS" stocks={topLosers} color="var(--red)" onSelect={onSelectTicker} />
            </div>

            {/* Summary Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                background: 'var(--bg-panel-alt)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '8px 16px',
                overflowX: 'auto',
                flexShrink: 0
            }}>
                {[
                    { label: 'ADVANCING', value: advancing.toLocaleString(), color: 'var(--green)' },
                    { label: 'DECLINING', value: declining.toLocaleString(), color: 'var(--red)' },
                    { label: 'UNCHANGED', value: unchanged.toLocaleString(), color: 'var(--text-muted)' },
                    { label: 'EXCHANGE MCAP', value: fmtBig(totalCap), color: 'var(--text-primary)' },
                    { label: 'STATUS', value: 'OPEN', color: 'var(--green)' },
                ].map(d => (
                    <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{d.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: d.color, fontVariantNumeric: 'tabular-nums' }}>{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LeaderCard({ ticker, name, price, changePct, currency, onClick }: { ticker: string; name: string; price: number; changePct: number; currency: string; onClick: () => void }) {
    const isPos = changePct >= 0;
    const [sparkline, setSparkline] = useState<{ close: number }[]>([]);

    useEffect(() => {
        let active = true;
        fetch(`/api/chart?ticker=${encodeURIComponent(ticker)}&range=1mo`)
            .then(r => r.json())
            .then(d => {
                if (active && d && d.candles) {
                    setSparkline(d.candles.slice(-30));
                }
            })
            .catch(() => { });
        return () => { active = false; };
    }, [ticker]);

    return (
        <div
            onClick={onClick}
            style={{
                background: 'var(--bg-panel-alt)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column'
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: isPos ? 'var(--green)' : 'var(--red)',
                opacity: 0.7,
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em' }}>{ticker}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>{name}</div>
                </div>
                {changePct !== 0 && (
                    <span className={`tag ${isPos ? 'tag-green' : 'tag-red'}`}>
                        {isPos ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
                    </span>
                )}
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                {price > 0
                    ? (price >= 1000 ? price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : price.toFixed(2))
                    : '...'}
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{currency}</span>
            </div>

            {sparkline.length > 0 && <MiniSparkline candles={sparkline} color={isPos ? 'var(--green)' : 'var(--red)'} />}
        </div>
    );
}

function MiniSparkline({ candles, color }: { candles: { close: number }[]; color: string }) {
    if (!candles || candles.length === 0) return null;
    const closes = candles.map(c => c.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    const w = 150, h = 32;
    const pts = closes.map((c, i) =>
        `${(i / (closes.length - 1)) * w},${h - ((c - min) / range) * h}`
    ).join(' ');

    return (
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', marginTop: 'auto' }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
        </svg>
    );
}

function MoverPanel({ title, stocks, color, onSelect }: { title: string; stocks: any[]; color: string; onSelect: (t: string) => void }) {
    return (
        <div className="panel">
            <div className="panel-header">
                <span className="panel-title">{title}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, opacity: 0.8 }} />
            </div>
            <div style={{ overflow: 'hidden' }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left' }}>🚩</th>
                            <th style={{ textAlign: 'left' }}>TICKER</th>
                            <th style={{ textAlign: 'left' }}>COMPANY</th>
                            <th style={{ textAlign: 'right' }}>PRICE</th>
                            <th style={{ textAlign: 'right' }}>CHG%</th>
                            <th style={{ textAlign: 'right' }}>MKT CAP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map(s => (
                            <tr key={s.ticker} onClick={() => onSelect(s.ticker)} style={{ cursor: 'pointer' }}>
                                <td style={{ fontSize: 14 }}>{s.flag}</td>
                                <td style={{ color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.06em' }}>{s.ticker}</td>
                                <td style={{ color: 'var(--text-secondary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</td>
                                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                    {s.price > 0 ? fmt(s.price) : '...'} <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>{s.currency}</span>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 600, color: s.changePct > 0 ? 'var(--green)' : s.changePct < 0 ? 'var(--red)' : 'var(--text-muted)' }}>
                                    {s.price > 0 ? fmtPct(s.changePct) : '—'}
                                </td>
                                <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 11 }}>{s.marketCap > 0 ? fmtBig(s.marketCap) : '—'}</td>
                            </tr>
                        ))}
                        {stocks.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No movers</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
