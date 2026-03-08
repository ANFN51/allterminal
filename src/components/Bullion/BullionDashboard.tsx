'use client';
import { useState, useEffect } from 'react';

const METALS = [
    { ticker: 'GC=F', name: 'Gold Futures', flag: '🟡' },
    { ticker: 'SI=F', name: 'Silver Futures', flag: '⚪️' },
    { ticker: 'PL=F', name: 'Platinum Futures', flag: '🪙' },
    { ticker: 'PA=F', name: 'Palladium Futures', flag: '🔗' },
];

interface QuoteData {
    ticker: string;
    price: number;
    changePct: number;
}

export default function BullionDashboard() {
    const [selected, setSelected] = useState(METALS[0]);
    const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const fetchQuotes = async () => {
            try {
                const res = await fetch(`/api/quote?tickers=${encodeURIComponent(METALS.map(m => m.ticker).join(','))}`);
                if (!res.ok) return;
                const data = await res.json();
                const arr = Array.isArray(data) ? data : [data];

                if (active) {
                    const map: Record<string, QuoteData> = {};
                    arr.forEach((q: any) => {
                        map[q.ticker] = q;
                    });
                    setQuotes(map);
                    setLoading(false);
                }
            } catch (e) {
                if (active) setLoading(false);
            }
        };

        fetchQuotes();
        const id = setInterval(fetchQuotes, 15000);
        return () => { active = false; clearInterval(id); };
    }, []);

    useEffect(() => {
        let active = true;
        const fetchChart = async () => {
            try {
                const res = await fetch(`/api/chart?ticker=${encodeURIComponent(selected.ticker)}&range=1mo&interval=1d`);
                if (!res.ok) return;
                const data = await res.json();
                if (active && data.candles) {
                    setHistory(data.candles);
                }
            } catch (e) {
                // Ignore
            }
        };
        fetchChart();
        return () => { active = false; };
    }, [selected]);

    const q = quotes[selected.ticker] || { price: 0, changePct: 0 };

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden', flexDirection: 'column' }}>
            <div style={{ padding: '8px 14px', background: 'var(--bg-panel-alt)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em' }}>PRECIOUS METALS</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>FUTURES CONTRACTS // USD</span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 9, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 4px var(--green)', animation: 'pulse 2s infinite' }} />
                        MARKET DATA LIVE
                    </span>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: 380, flexShrink: 0, borderRight: '1px solid var(--border)', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>METAL</th>
                                <th style={{ textAlign: 'right' }}>PRICE (USD)</th>
                                <th style={{ textAlign: 'right' }}>CHANGE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {METALS.map(b => {
                                const qData = quotes[b.ticker] || { price: 0, changePct: 0 };
                                return (
                                    <tr key={b.ticker} onClick={() => setSelected(b)}
                                        style={{
                                            cursor: 'pointer',
                                            background: selected.ticker === b.ticker ? 'var(--amber-muted)' : undefined,
                                        }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 18 }}>{b.flag}</span>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 12, color: selected.ticker === b.ticker ? 'var(--amber)' : 'var(--text-primary)', letterSpacing: '0.05em' }}>
                                                        {b.ticker}
                                                    </div>
                                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{b.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 13 }}>
                                            {qData.price.toFixed(2)}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: 11, color: qData.changePct >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                                                {qData.changePct >= 0 ? '+' : ''}{qData.changePct.toFixed(2)}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: 24, background: 'radial-gradient(circle at top right, rgba(255,153,0,0.03), transparent 60%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <span style={{ fontSize: 36 }}>{selected.flag}</span>
                        <div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.05em' }}>{selected.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Live Futures Data ({selected.ticker})</div>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div style={{ fontSize: 42, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{q.price.toFixed(2)}</div>
                            <div style={{ fontSize: 15, color: q.changePct >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 8, fontWeight: 600 }}>
                                {q.changePct >= 0 ? '+' : ''}{(q.price * (q.changePct / 100)).toFixed(2)} ({q.changePct >= 0 ? '+' : ''}{q.changePct.toFixed(2)}%)
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
                        <div className="stat-card" style={{ background: 'var(--bg-surface)' }}>
                            <span className="stat-label">MARKET TREND</span>
                            <span className="stat-value" style={{ color: q.changePct >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 14 }}>
                                {q.changePct > 0 ? 'BULLISH' : 'BEARISH'}
                            </span>
                        </div>
                        <div className="stat-card" style={{ background: 'var(--bg-surface)' }}>
                            <span className="stat-label">DATA SOURCE</span>
                            <span className="stat-value" style={{ color: 'var(--amber)', fontSize: 14 }}>Live Pricing API</span>
                        </div>
                    </div>

                    {history.length > 0 && (
                        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, padding: 12 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>
                                {selected.ticker} — 30 DAY SPOT CHART
                            </div>
                            <div style={{ height: 140, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                                {history.map((c, i) => {
                                    const min = Math.min(...history.map(x => x.close));
                                    const max = Math.max(...history.map(x => x.close));
                                    const h = Math.max(5, ((c.close - min) / (max - min || 1)) * 140);
                                    return (
                                        <div key={i} style={{ flex: 1, height: h, background: 'var(--amber)', opacity: 0.8 }} title={new Date(c.time * 1000).toLocaleDateString()} />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
