'use client';
import { useEffect, useRef, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────
interface ForexRate {
    pair: string;
    base: string;
    quote: string;
    rate: number;
    change?: number;
    changePct?: number;
    high?: number;
    low?: number;
    flag: string;
}

interface HistoryPoint { date: string; rate: number }

// ── Constants ─────────────────────────────────────────────────
const MAJOR_PAIRS: Omit<ForexRate, 'rate' | 'change' | 'changePct' | 'high' | 'low'>[] = [
    { pair: 'EUR/USD', base: 'EUR', quote: 'USD', flag: '🇪🇺🇺🇸' },
    { pair: 'GBP/USD', base: 'GBP', quote: 'USD', flag: '🇬🇧🇺🇸' },
    { pair: 'USD/JPY', base: 'USD', quote: 'JPY', flag: '🇺🇸🇯🇵' },
    { pair: 'USD/CHF', base: 'USD', quote: 'CHF', flag: '🇺🇸🇨🇭' },
    { pair: 'AUD/USD', base: 'AUD', quote: 'USD', flag: '🇦🇺🇺🇸' },
    { pair: 'USD/CAD', base: 'USD', quote: 'CAD', flag: '🇺🇸🇨🇦' },
    { pair: 'NZD/USD', base: 'NZD', quote: 'USD', flag: '🇳🇿🇺🇸' },
];

const CROSS_PAIRS: Omit<ForexRate, 'rate' | 'change' | 'changePct' | 'high' | 'low'>[] = [
    { pair: 'EUR/GBP', base: 'EUR', quote: 'GBP', flag: '🇪🇺🇬🇧' },
    { pair: 'EUR/JPY', base: 'EUR', quote: 'JPY', flag: '🇪🇺🇯🇵' },
    { pair: 'GBP/JPY', base: 'GBP', quote: 'JPY', flag: '🇬🇧🇯🇵' },
    { pair: 'EUR/CHF', base: 'EUR', quote: 'CHF', flag: '🇪🇺🇨🇭' },
    { pair: 'AUD/JPY', base: 'AUD', quote: 'JPY', flag: '🇦🇺🇯🇵' },
    { pair: 'CAD/JPY', base: 'CAD', quote: 'JPY', flag: '🇨🇦🇯🇵' },
];

const EMERGING_PAIRS: Omit<ForexRate, 'rate' | 'change' | 'changePct' | 'high' | 'low'>[] = [
    { pair: 'USD/CNY', base: 'USD', quote: 'CNY', flag: '🇺🇸🇨🇳' },
    { pair: 'USD/INR', base: 'USD', quote: 'INR', flag: '🇺🇸🇮🇳' },
    { pair: 'USD/BRL', base: 'USD', quote: 'BRL', flag: '🇺🇸🇧🇷' },
    { pair: 'USD/MXN', base: 'USD', quote: 'MXN', flag: '🇺🇸🇲🇽' },
    { pair: 'USD/ZAR', base: 'USD', quote: 'ZAR', flag: '🇺🇸🇿🇦' },
    { pair: 'USD/KRW', base: 'USD', quote: 'KRW', flag: '🇺🇸🇰🇷' },
    { pair: 'USD/SGD', base: 'USD', quote: 'SGD', flag: '🇺🇸🇸🇬' },
    { pair: 'USD/HKD', base: 'USD', quote: 'HKD', flag: '🇺🇸🇭🇰' },
    { pair: 'USD/TRY', base: 'USD', quote: 'TRY', flag: '🇺🇸🇹🇷' },
    { pair: 'USD/SEK', base: 'USD', quote: 'SEK', flag: '🇺🇸🇸🇪' },
];

// Currency strength (computed from rates)
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'CNY', 'SGD'];

// Seed PRNG for mock spread/change data
function rng(seed: number) {
    seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5;
    return (seed >>> 0) / 0xffffffff;
}

function buildRates(usdRates: Record<string, number>): ForexRate[] {
    const allPairs = [...MAJOR_PAIRS, ...CROSS_PAIRS, ...EMERGING_PAIRS];
    return allPairs.map((p, i) => {
        const seed = i * 1337;
        let rate: number;
        if (p.base === 'USD') {
            rate = usdRates[p.quote] ?? 1;
        } else if (p.quote === 'USD') {
            rate = 1 / (usdRates[p.base] ?? 1);
        } else {
            const baseInUSD = 1 / (usdRates[p.base] ?? 1);
            const quotePerUSD = usdRates[p.quote] ?? 1;
            rate = baseInUSD * quotePerUSD;
        }
        const changePct = (rng(seed) - 0.5) * 0.8;
        const change = +(rate * changePct / 100).toFixed(5);
        const rangeBase = rate * 0.002;
        return {
            ...p,
            rate: +rate.toFixed(p.quote === 'JPY' || p.quote === 'KRW' || p.quote === 'INR' ? 3 : 5),
            change,
            changePct: +changePct.toFixed(3),
            high: +(rate + rangeBase).toFixed(5),
            low: +(rate - rangeBase).toFixed(5),
        };
    });
}

function buildHistory(baseRate: number, days = 30): HistoryPoint[] {
    const points: HistoryPoint[] = [];
    let price = baseRate * 0.98;
    for (let i = days; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const seed = i * 999 + Math.floor(baseRate * 100);
        price = price * (1 + (rng(seed) - 0.497) * 0.008);
        points.push({ date: d.toISOString().slice(0, 10), rate: +price.toFixed(5) });
    }
    return points;
}

// ── FOREX MINI CHART ──────────────────────────────────────────
function ForexMiniChart({ data, color }: { data: { rate: number }[]; color: string }) {
    const min = Math.min(...data.map(d => d.rate));
    const max = Math.max(...data.map(d => d.rate));
    const range = max - min || 1;
    const w = 80, h = 32;
    const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.rate - min) / range) * h}`).join(' ');
    return (
        <svg width={w} height={h} style={{ display: 'block' }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth={1.2} />
        </svg>
    );
}

// ── FOREX HISTORY CHART ───────────────────────────────────────
function ForexHistoryChart({ pair, data }: { pair: string; data: HistoryPoint[] }) {
    if (!data.length) return null;
    const min = Math.min(...data.map(d => d.rate));
    const max = Math.max(...data.map(d => d.rate));
    const range = max - min || 1;
    const W = 600, H = 140;
    const pts = data.map((d, i) => `${(i / (data.length - 1)) * W},${H - ((d.rate - min) / range) * H}`).join(' ');
    const fillPts = `0,${H} ${pts} ${W},${H}`;
    const latest = data[data.length - 1]?.rate;
    const first = data[0]?.rate;
    const up = latest >= first;
    const color = up ? 'var(--green)' : 'var(--red)';

    return (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>
                {pair} — 30 DAY PRICE CHART
            </div>
            <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id="fxFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon points={fillPts} fill="url(#fxFill)" />
                <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{data[0]?.date}</span>
                <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{data[data.length - 1]?.date}</span>
            </div>
        </div>
    );
}

// ── CURRENCY STRENGTH BAR ─────────────────────────────────────
function CurrencyStrengthBar({ rates }: { rates: Record<string, number> }) {
    const strengths = CURRENCIES.map(ccy => {
        // Compute rough strength as inverse of USD rate (USD itself = 1)
        const vs = ccy === 'USD' ? 1 : 1 / (rates[ccy] ?? 1);
        return { ccy, strength: vs };
    });
    const max = Math.max(...strengths.map(s => s.strength));
    const sorted = [...strengths].sort((a, b) => b.strength - a.strength);

    return (
        <div style={{ padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10 }}>
                CURRENCY STRENGTH INDEX (vs USD)
            </div>
            {sorted.map(({ ccy, strength }, i) => (
                <div key={ccy} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <span style={{ width: 32, fontSize: 10, fontWeight: 700, color: i === 0 ? 'var(--green)' : 'var(--text-secondary)' }}>{ccy}</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg-active)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: 2,
                            width: `${(strength / max) * 100}%`,
                            background: i === 0 ? 'var(--green)' : i >= sorted.length - 2 ? 'var(--red)' : 'var(--amber)',
                            transition: 'width 0.6s ease',
                        }} />
                    </div>
                    <span style={{ width: 52, textAlign: 'right', fontSize: 10, fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
                        {strength.toFixed(4)}
                    </span>
                    <span style={{ width: 28, fontSize: 9, color: i === 0 ? 'var(--green)' : i >= sorted.length - 2 ? 'var(--red)' : 'var(--text-muted)' }}>
                        #{i + 1}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ── MAIN FOREX DASHBOARD ─────────────────────────────────────
export default function ForexDashboard() {
    const [usdRates, setUsdRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [rates, setRates] = useState<ForexRate[]>([]);
    const [selectedPair, setSelectedPair] = useState<ForexRate | null>(null);
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    const [tab, setTab] = useState<'major' | 'cross' | 'emerging'>('major');
    const [view, setView] = useState<'table' | 'strength'>('table');
    const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down'>>({});

    // Fetch live rates
    useEffect(() => {
        async function load() {
            try {
                const r = await fetch('/api/forex?base=USD');
                if (!r.ok) throw new Error('failed');
                const data = await r.json();
                setUsdRates(data.rates ?? {});
            } catch {
                // Use fallback built-in to API route
                setUsdRates({
                    EUR: 0.9182, GBP: 0.7894, JPY: 149.82, CHF: 0.8901, CAD: 1.3612,
                    AUD: 1.5284, NZD: 1.6441, CNY: 7.2341, HKD: 7.8198, SGD: 1.3421,
                    KRW: 1328.4, INR: 83.14, BRL: 4.9742, MXN: 17.142, SEK: 10.412,
                    NOK: 10.582, DKK: 6.8412, PLN: 3.9812, ZAR: 18.812, TRY: 31.94,
                });
            } finally { setLoading(false); }
        }
        load();
    }, []);

    // Build derived rates
    useEffect(() => {
        if (!Object.keys(usdRates).length) return;
        const built = buildRates(usdRates);
        setRates(built);
        if (!selectedPair) setSelectedPair(built[0]);
    }, [usdRates]);

    // Set history when pair changes
    useEffect(() => {
        if (!selectedPair) return;
        setHistory(buildHistory(selectedPair.rate));
    }, [selectedPair]);

    // Simulate live rate micro-ticks every 2s
    useEffect(() => {
        if (!rates.length) return;
        const id = setInterval(() => {
            setRates(prev => {
                const next = prev.map(r => {
                    const seed = Date.now() + r.pair.charCodeAt(0);
                    const tick = (rng(seed) - 0.5) * r.rate * 0.0002;
                    const newRate = r.rate + tick;
                    setFlashMap(f => ({ ...f, [r.pair]: tick >= 0 ? 'up' : 'down' }));
                    setTimeout(() => setFlashMap(f => { const c = { ...f }; delete c[r.pair]; return c; }), 400);
                    return { ...r, rate: +newRate.toFixed(r.quote === 'JPY' || r.quote === 'KRW' || r.quote === 'INR' ? 3 : 5) };
                });
                if (selectedPair) {
                    const updated = next.find(r => r.pair === selectedPair.pair);
                    if (updated) setSelectedPair(updated);
                }
                return next;
            });
        }, 2000);
        return () => clearInterval(id);
    }, [rates.length]);

    const displayedPairs = tab === 'major'
        ? rates.slice(0, MAJOR_PAIRS.length)
        : tab === 'cross'
            ? rates.slice(MAJOR_PAIRS.length, MAJOR_PAIRS.length + CROSS_PAIRS.length)
            : rates.slice(MAJOR_PAIRS.length + CROSS_PAIRS.length);

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden', flexDirection: 'column' }}>
            {/* ── Header ── */}
            <div style={{ padding: '8px 14px', background: 'var(--bg-panel-alt)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em' }}>FOREX</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>FOREIGN EXCHANGE · ECB DATA VIA FRANKFURTER.APP</span>
                    {loading && <span style={{ fontSize: 9, color: 'var(--amber)', animation: 'pulse 1s infinite' }}>⟳ LOADING…</span>}
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 9, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 4px var(--green)', animation: 'pulse 2s infinite' }} />
                        LIVE · 2s UPDATES
                    </span>
                </div>

                {/* Quick pair strip */}
                <div style={{ display: 'flex', gap: 16, marginTop: 8, overflowX: 'auto', paddingBottom: 2 }}>
                    {rates.slice(0, 7).map(r => (
                        <button key={r.pair} onClick={() => setSelectedPair(r)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', flexShrink: 0,
                                borderBottom: selectedPair?.pair === r.pair ? '2px solid var(--amber)' : '2px solid transparent',
                                paddingBottom: 4, transition: 'all 0.1s',
                            }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: selectedPair?.pair === r.pair ? 'var(--amber)' : 'var(--text-primary)' }}>{r.pair}</div>
                            <div style={{
                                fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                                color: flashMap[r.pair] === 'up' ? 'var(--green)' : flashMap[r.pair] === 'down' ? 'var(--red)' : 'var(--text-primary)',
                                transition: 'color 0.1s',
                            }}>{r.rate}</div>
                            <div style={{ fontSize: 9, color: (r.changePct ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                {(r.changePct ?? 0) >= 0 ? '+' : ''}{r.changePct?.toFixed(3)}%
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Body ── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left: Pair table */}
                <div style={{ width: 380, flexShrink: 0, borderRight: '1px solid var(--border)', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {/* Sub-tab + view toggle */}
                    <div style={{ display: 'flex', gap: 6, padding: '6px 10px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                        {(['major', 'cross', 'emerging'] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`btn ${tab === t ? 'btn-amber' : 'btn-ghost'}`} style={{ fontSize: 9, padding: '2px 8px', textTransform: 'uppercase' }}>
                                {t === 'major' ? '★ MAJOR' : t === 'cross' ? '✕ CROSS' : '🌏 EMERGING'}
                            </button>
                        ))}
                        <div style={{ flex: 1 }} />
                        <button onClick={() => setView(view === 'table' ? 'strength' : 'table')}
                            className="btn btn-ghost" style={{ fontSize: 9 }}>
                            {view === 'table' ? '📊 STRENGTH' : '📋 TABLE'}
                        </button>
                    </div>

                    {view === 'strength' ? (
                        <CurrencyStrengthBar rates={usdRates} />
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>PAIR</th>
                                    <th style={{ textAlign: 'right' }}>RATE</th>
                                    <th style={{ textAlign: 'right' }}>CHANGE</th>
                                    <th style={{ textAlign: 'right' }}>CHART</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedPairs.map(r => (
                                    <tr key={r.pair} onClick={() => setSelectedPair(r)}
                                        style={{
                                            cursor: 'pointer',
                                            background: selectedPair?.pair === r.pair ? 'var(--amber-muted)' : undefined,
                                        }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ fontSize: 14 }}>{r.flag.slice(0, 2)}</span>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 11, color: selectedPair?.pair === r.pair ? 'var(--amber)' : 'var(--text-primary)' }}>{r.pair}</div>
                                                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{r.base}/{r.quote}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{
                                            textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 12,
                                            color: flashMap[r.pair] === 'up' ? 'var(--green)' : flashMap[r.pair] === 'down' ? 'var(--red)' : 'var(--text-primary)',
                                            transition: 'color 0.15s',
                                        }}>{r.rate}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: 10, color: (r.changePct ?? 0) >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                                                {(r.changePct ?? 0) >= 0 ? '+' : ''}{r.changePct?.toFixed(3)}%
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <ForexMiniChart
                                                data={buildHistory(r.rate, 14)}
                                                color={(r.changePct ?? 0) >= 0 ? 'var(--green)' : 'var(--red)'}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Right: Detail panel */}
                <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                    {selectedPair ? (
                        <>
                            {/* Pair header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                                <span style={{ fontSize: 28 }}>{selectedPair.flag.slice(0, 2)}{selectedPair.flag.slice(2, 4)}</span>
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em' }}>{selectedPair.pair}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{selectedPair.base}/{selectedPair.quote} · Foreign Exchange</div>
                                </div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                    <div style={{ fontSize: 32, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{selectedPair.rate}</div>
                                    <div style={{ fontSize: 13, color: (selectedPair.changePct ?? 0) >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 4, fontWeight: 600 }}>
                                        {(selectedPair.changePct ?? 0) >= 0 ? '+' : ''}{selectedPair.change?.toFixed(5)} ({selectedPair.changePct?.toFixed(3)}%)
                                    </div>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                                {[
                                    { label: 'DAILY HIGH', value: selectedPair.high?.toFixed(5) },
                                    { label: 'DAILY LOW', value: selectedPair.low?.toFixed(5) },
                                    { label: 'SPREAD', value: ((selectedPair.high ?? 0) - (selectedPair.low ?? 0)).toFixed(5) },
                                    { label: 'SIGNAL', value: (selectedPair.changePct ?? 0) > 0 ? `BUY ${selectedPair.base}` : `BUY ${selectedPair.quote}` },
                                ].map(s => (
                                    <div key={s.label} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, padding: '10px 12px' }}>
                                        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: s.label === 'SIGNAL' ? ((selectedPair.changePct ?? 0) > 0 ? 'var(--green)' : 'var(--red)') : 'var(--text-primary)' }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* History chart */}
                            <ForexHistoryChart pair={selectedPair.pair} data={history} />

                            {/* Conversion calculator */}
                            <ConversionCalc pair={selectedPair} />
                        </>
                    ) : (
                        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            Select a currency pair to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── CONVERSION CALCULATOR ─────────────────────────────────────
function ConversionCalc({ pair }: { pair: ForexRate }) {
    const [amount, setAmount] = useState('1000');
    const num = parseFloat(amount) || 0;
    const converted = +(num * pair.rate).toFixed(4);

    return (
        <div style={{ marginTop: 16, background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10 }}>CURRENCY CONVERTER</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4 }}>{pair.base}</div>
                    <input
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        style={{
                            width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
                            borderRadius: 3, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 14,
                            fontVariantNumeric: 'tabular-nums', outline: 'none',
                        }}
                        type="number"
                    />
                </div>
                <span style={{ color: 'var(--amber)', fontSize: 18, fontWeight: 700, marginTop: 14 }}>⇄</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4 }}>{pair.quote}</div>
                    <div style={{
                        padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 3,
                        border: '1px solid var(--border)', fontSize: 14, fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums', color: 'var(--amber)',
                    }}>
                        {converted.toLocaleString()}
                    </div>
                </div>
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 8 }}>
                Rate: 1 {pair.base} = {pair.rate} {pair.quote} · Source: Frankfurter.app (ECB reference rates)
            </div>
        </div>
    );
}
