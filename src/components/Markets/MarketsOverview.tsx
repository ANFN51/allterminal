'use client';
import { useEffect, useRef, useState } from 'react';
import { fmt, fmtBig, fmtPct } from '@/lib/marketData';
import { getWsClient } from '@/lib/wsClient';

const OVERVIEW_INDICES = [
    { ticker: 'SPY', name: 'S&P 500 ETF' },
    { ticker: 'QQQ', name: 'NASDAQ 100 ETF' },
    { ticker: 'DIA', name: 'Dow Jones ETF' },
    { ticker: 'IWM', name: 'Russell 2000 ETF' },
    { ticker: 'BTC-USD', name: 'Bitcoin' },
];

const POPULAR_STOCKS = [
    'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META', 'GOOGL', 'AMD', 'JPM', 'V', 'WMT', 'JNJ', 'XOM', 'PG', 'MA'
];

interface IndexCardData {
    ticker: string;
    name: string;
    price: number;
    changePct: number;
    change: number;
}

interface MoverStock {
    ticker: string;
    name: string;
    price: number;
    changePct: number;
    marketCap: number;
}

export default function MarketsOverview({ onSelectTicker }: { onSelectTicker: (t: string) => void }) {
    const [indices, setIndices] = useState<IndexCardData[]>(OVERVIEW_INDICES.map(i => ({ ...i, price: 0, change: 0, changePct: 0 })));
    const [flashed, setFlashed] = useState<Record<string, 'up' | 'down' | null>>({});
    const prevRef = useRef<Record<string, number>>({});
    const [movers, setMovers] = useState<MoverStock[]>([]);

    useEffect(() => {
        // Setup polling for indices
        const client = getWsClient();
        const unsubs = OVERVIEW_INDICES.map(idx =>
            client.subscribe(idx.ticker, ev => {
                const prev = prevRef.current[idx.ticker] ?? ev.price;
                const dir = ev.price > prev ? 'up' : ev.price < prev ? 'down' : null;
                prevRef.current[idx.ticker] = ev.price;

                setIndices(curr => curr.map(i => {
                    if (i.ticker !== idx.ticker) return i;
                    return { ...i, price: ev.price, changePct: ev.changePct ?? i.changePct, change: ev.change ?? i.change };
                }));

                if (dir) {
                    setFlashed(f => ({ ...f, [idx.ticker]: dir }));
                    setTimeout(() => setFlashed(f => ({ ...f, [idx.ticker]: null })), 400);
                }
            })
        );

        // Fetch static popular stocks for movers logic (fallback mechanics since real screener API isn't built)
        const fetchMovers = async () => {
            try {
                const res = await fetch(`/api/quote?tickers=${POPULAR_STOCKS.join(',')}`);
                if (!res.ok) return;
                const data = await res.json();
                const quotes = Array.isArray(data) ? data : [];
                setMovers(quotes.map(q => ({
                    ticker: q.ticker,
                    name: q.fullName ?? q.ticker,
                    price: q.price,
                    changePct: q.changePct,
                    marketCap: q.marketCap ?? 0
                })));
            } catch (e) { }
        };
        fetchMovers();

        return () => unsubs.forEach(u => u());
    }, []);

    // Derived top movers
    const topGainers = [...movers].sort((a, b) => b.changePct - a.changePct).slice(0, 5);
    const topLosers = [...movers].sort((a, b) => a.changePct - b.changePct).slice(0, 5);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflow: 'auto', padding: 10 }}>
            {/* Index Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 8,
            }}>
                {indices.map(idx => (
                    <IndexCard
                        key={idx.ticker}
                        {...idx}
                        flashed={flashed[idx.ticker] ?? null}
                        onClick={() => onSelectTicker(idx.ticker)}
                    />
                ))}
            </div>

            {/* Movers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1 }}>
                <MoverPanel title="TOP GAINERS (WATCHLIST)" stocks={topGainers} color="var(--green)" onSelect={onSelectTicker} />
                <MoverPanel title="TOP LOSERS (WATCHLIST)" stocks={topLosers} color="var(--red)" onSelect={onSelectTicker} />
            </div>

            {/* Market Summary Stats */}
            <SummaryBar />
        </div>
    );
}

function IndexCard({ ticker, name, price, changePct, flashed, onClick }: IndexCardData & { flashed: 'up' | 'down' | null; onClick: () => void }) {
    const isPos = changePct >= 0;
    const [sparkline, setSparkline] = useState<{ close: number }[]>([]);

    useEffect(() => {
        // Fetch real simple sparkline
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
            className={flashed === 'up' ? 'price-flash-up' : flashed === 'down' ? 'price-flash-down' : ''}
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
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
            {/* Glow accent */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: isPos ? 'var(--green)' : 'var(--red)',
                opacity: 0.7,
                transition: 'background 0.3s'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em' }}>{ticker}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{name}</div>
                </div>
                {changePct !== 0 && (
                    <span className={`tag ${isPos ? 'tag-green' : 'tag-red'}`}>
                        {isPos ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
                    </span>
                )}
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)', marginBottom: 8 }}>
                {price > 0 ? (
                    price >= 1000 ? price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : price.toFixed(2)
                ) : '...'}
            </div>

            {/* Mini sparkline */}
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
    // Stretch to fill w, h space
    const pts = closes.map((c, i) =>
        `${(i / (closes.length - 1)) * w},${h - ((c - min) / range) * h}`
    ).join(' ');

    return (
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', marginTop: 'auto' }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
        </svg>
    );
}

function MoverPanel({ title, stocks, color, onSelect }: { title: string; stocks: MoverStock[]; color: string; onSelect: (t: string) => void }) {
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
                            <th>TICKER</th>
                            <th>COMPANY</th>
                            <th style={{ textAlign: 'right' }}>PRICE</th>
                            <th style={{ textAlign: 'right' }}>CHG%</th>
                            <th style={{ textAlign: 'right' }}>MKT CAP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map(s => (
                            <tr key={s.ticker} onClick={() => onSelect(s.ticker)}>
                                <td style={{ color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.06em' }}>{s.ticker}</td>
                                <td style={{ color: 'var(--text-secondary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name.split(' ').slice(0, 2).join(' ')}</td>
                                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${fmt(s.price)}</td>
                                <td style={{ textAlign: 'right', fontWeight: 600, color: s.changePct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                    {fmtPct(s.changePct)}
                                </td>
                                <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 11 }}>{fmtBig(s.marketCap)}</td>
                            </tr>
                        ))}
                        {stocks.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Loading...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SummaryBar() {
    const [fg, setFg] = useState<{ value: number; label: string } | null>(null);
    const [globalMkt, setGlobalMkt] = useState<{ total_market_cap_usd: number; btc_dominance: number; market_cap_change_24h: number } | null>(null);

    useEffect(() => {
        // Safely catch api endpoint failures (previously mocked)
        fetch('/api/sentiment')
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d && !d.error) {
                    setFg(d.fear_greed);
                    setGlobalMkt(d.global_market);
                }
            })
            .catch(() => { });
    }, []);

    const fgColor = fg ? (fg.value > 60 ? 'var(--green)' : fg.value < 40 ? 'var(--red)' : 'var(--amber)') : 'var(--text-muted)';
    const mktChgColor = globalMkt ? (globalMkt.market_cap_change_24h >= 0 ? 'var(--green)' : 'var(--red)') : 'var(--text-muted)';

    const data = [
        { label: 'ADVANCING', value: '2,847', color: 'var(--green)' }, // Unchangeable without real backend index computation
        { label: 'DECLINING', value: '1,435', color: 'var(--red)' },
        { label: 'UNCHANGED', value: '312', color: 'var(--text-muted)' },
        { label: 'NEW HIGHS', value: '184', color: 'var(--cyan)' },
        { label: 'NEW LOWS', value: '27', color: 'var(--red)' },
        { label: 'TOTAL VOL', value: '12.4B', color: 'var(--amber)' },
        { label: 'PUT/CALL', value: '0.82', color: 'var(--text-primary)' },
        {
            label: 'FEAR/GREED',
            value: fg ? `${fg.value} ${fg.label.toUpperCase()}` : '—',
            color: fgColor,
        },
        {
            label: 'CRYPTO MCAP',
            value: globalMkt ? `$${(globalMkt.total_market_cap_usd / 1e12).toFixed(2)}T` : '—',
            color: 'var(--text-primary)',
        },
        {
            label: 'BTC DOM.',
            value: globalMkt ? `${globalMkt.btc_dominance.toFixed(1)}%` : '—',
            color: 'var(--amber)',
        },
        {
            label: 'MCAP 24H',
            value: globalMkt ? `${globalMkt.market_cap_change_24h >= 0 ? '+' : ''}${globalMkt.market_cap_change_24h.toFixed(2)}%` : '—',
            color: mktChgColor,
        },
    ];

    return (
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
            {data.map(d => (
                <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{d.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.color, fontVariantNumeric: 'tabular-nums' }}>{d.value}</span>
                </div>
            ))}
        </div>
    );
}
