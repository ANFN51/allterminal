'use client';
import { useEffect, useRef, useState } from 'react';
import { INDICES, STOCKS, fmt, fmtBig, fmtPct, fmtVol, generateCandles } from '@/lib/marketData';
import { getWsClient } from '@/lib/wsClient';

const SYMBOL_PRICES: Record<string, number> = {
    SPY: 507.86, QQQ: 435.44, DJI: 38795, VIX: 14.82,
    BTC: 87420, ETH: 3218.50, SOL: 142.30, GOLD: 2381.40,
};

interface IndexCard {
    ticker: string;
    name: string;
    price: number;
    changePct: number;
    change: number;
}

export default function MarketsOverview({ onSelectTicker }: { onSelectTicker: (t: string) => void }) {
    const [indices, setIndices] = useState<IndexCard[]>(INDICES.map(i => ({
        ...i, change: i.price * i.changePct / 100
    })));
    const [flashed, setFlashed] = useState<Record<string, 'up' | 'down' | null>>({});
    const prevRef = useRef<Record<string, number>>({});

    useEffect(() => {
        const client = getWsClient();
        const tickers = ['SPY', 'QQQ', 'BTC', 'ETH', 'SOL'];
        const unsubs = tickers.map(t =>
            client.subscribe(t, ev => {
                const prev = prevRef.current[t] ?? ev.price;
                const dir = ev.price >= prev ? 'up' : 'down';
                prevRef.current[t] = ev.price;

                setIndices(idx => idx.map(i => {
                    if (i.ticker !== t) return i;
                    const baseline = SYMBOL_PRICES[t] ?? i.price;
                    const changePct = ((ev.price - baseline) / baseline) * 100 + i.changePct;
                    return { ...i, price: ev.price, changePct: +changePct.toFixed(2) };
                }));
                setFlashed(f => ({ ...f, [t]: dir }));
                setTimeout(() => setFlashed(f => ({ ...f, [t]: null })), 400);
            })
        );
        return () => unsubs.forEach(u => u());
    }, []);

    // Top movers from stocks
    const allStocks = Object.values(STOCKS);
    const topGainers = [...allStocks].sort((a, b) => b.changePct - a.changePct).slice(0, 5);
    const topLosers = [...allStocks].sort((a, b) => a.changePct - b.changePct).slice(0, 5);

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
                        flashed={flashed[idx.ticker]}
                        onClick={() => onSelectTicker(idx.ticker)}
                    />
                ))}
            </div>

            {/* Movers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1 }}>
                <MoverPanel title="TOP GAINERS" stocks={topGainers} color="var(--green)" onSelect={onSelectTicker} />
                <MoverPanel title="TOP LOSERS" stocks={topLosers} color="var(--red)" onSelect={onSelectTicker} />
            </div>

            {/* Market Summary Stats */}
            <SummaryBar />
        </div>
    );
}

function IndexCard({ ticker, name, price, changePct, flashed, onClick }: IndexCard & { flashed: 'up' | 'down' | null; onClick: () => void }) {
    const isPos = changePct >= 0;
    const candles = generateCandles(price, 30, 0.008, ticker.charCodeAt(0));

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
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
            {/* Glow accent */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: isPos ? 'var(--green)' : 'var(--red)',
                opacity: 0.7,
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em' }}>{ticker}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{name}</div>
                </div>
                <span className={`tag ${isPos ? 'tag-green' : 'tag-red'}`}>
                    {isPos ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
                </span>
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)', marginBottom: 8 }}>
                {price >= 1000
                    ? price.toLocaleString('en-US', { minimumFractionDigits: 0 })
                    : price.toFixed(2)}
            </div>

            {/* Mini sparkline */}
            <MiniSparkline candles={candles} color={isPos ? 'var(--green)' : 'var(--red)'} />
        </div>
    );
}

function MiniSparkline({ candles, color }: { candles: { close: number }[]; color: string }) {
    const closes = candles.map(c => c.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    const w = 168, h = 32;
    const pts = closes.map((c, i) =>
        `${(i / (closes.length - 1)) * w},${h - ((c - min) / range) * h}`
    ).join(' ');

    return (
        <svg width={w} height={h} style={{ display: 'block' }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
        </svg>
    );
}

function MoverPanel({ title, stocks, color, onSelect }: { title: string; stocks: typeof STOCKS[string][]; color: string; onSelect: (t: string) => void }) {
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
        fetch('/api/sentiment')
            .then(r => r.json())
            .then(d => {
                setFg(d.fear_greed);
                setGlobalMkt(d.global_market);
            })
            .catch(() => { });
    }, []);

    const fgColor = fg ? (fg.value > 60 ? 'var(--green)' : fg.value < 40 ? 'var(--red)' : 'var(--amber)') : 'var(--text-muted)';
    const mktChgColor = globalMkt ? (globalMkt.market_cap_change_24h >= 0 ? 'var(--green)' : 'var(--red)') : 'var(--text-muted)';

    const data = [
        { label: 'ADVANCING', value: '2,847', color: 'var(--green)' },
        { label: 'DECLINING', value: '1,435', color: 'var(--red)' },
        { label: 'UNCHANGED', value: '312', color: 'var(--text-muted)' },
        { label: 'NEW HIGHS', value: '184', color: 'var(--cyan)' },
        { label: 'NEW LOWS', value: '27', color: 'var(--red)' },
        { label: 'TOTAL VOL', value: '12.4B', color: 'var(--amber)' },
        { label: 'PUT/CALL', value: '0.82', color: 'var(--text-primary)' },
        {
            label: 'FEAR/GREED',
            value: fg ? `${fg.value} ${fg.label.toUpperCase()}` : '62 GREED',
            color: fgColor,
        },
        {
            label: 'CRYPTO MCAP',
            value: globalMkt ? `$${(globalMkt.total_market_cap_usd / 1e12).toFixed(2)}T` : '$3.20T',
            color: 'var(--text-primary)',
        },
        {
            label: 'BTC DOM.',
            value: globalMkt ? `${globalMkt.btc_dominance.toFixed(1)}%` : '52.4%',
            color: 'var(--amber)',
        },
        {
            label: 'MCAP 24H',
            value: globalMkt ? `${globalMkt.market_cap_change_24h >= 0 ? '+' : ''}${globalMkt.market_cap_change_24h.toFixed(2)}%` : '+1.24%',
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

