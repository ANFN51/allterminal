'use client';
import { useState, useEffect } from 'react';
import { fmt, fmtPct } from '@/lib/marketData';
import PortfolioLanding from './PortfolioLanding';

type EnrichedPosition = Position & {
    price: number;
    currentValue: number;
    costBasis: number;
    pnl: number;
    pnlPct: number;
};

interface Position {
    ticker: string;
    shares: number;
    avgCost: number;
}

const DEFAULT_POSITIONS: Position[] = [];

export default function Portfolio() {
    const [isSetup, setIsSetup] = useState(false);
    const [positions, setPositions] = useState<Position[]>(DEFAULT_POSITIONS);
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});
    const [newTicker, setNewTicker] = useState('');
    const [newShares, setNewShares] = useState('');
    const [newCost, setNewCost] = useState('');
    const [loadingTicker, setLoadingTicker] = useState(false);

    useEffect(() => {
        if (!isSetup || positions.length === 0) return;
        let active = true;

        const fetchPrices = async () => {
            try {
                const tickers = positions.map(p => p.ticker).join(',');
                const res = await fetch(`/api/quote?tickers=${encodeURIComponent(tickers)}`);
                if (!res.ok) return;
                const data = await res.json();
                const quotes = Array.isArray(data) ? data : [data];

                if (active) {
                    const priceMap: Record<string, number> = {};
                    quotes.forEach(q => {
                        priceMap[q.ticker] = q.price;
                    });
                    setLivePrices(priceMap);
                }
            } catch (e) {
                console.error('Failed to fetch portfolio prices', e);
            }
        };

        fetchPrices();
        const id = setInterval(fetchPrices, 15000);
        return () => {
            active = false;
            clearInterval(id);
        };
    }, [isSetup, positions]);

    if (!isSetup) {
        return <PortfolioLanding onSetupManual={() => setIsSetup(true)} />;
    }

    const enriched: EnrichedPosition[] = positions.map(p => {
        const price = livePrices[p.ticker] || p.avgCost; // fallback to cost if not loaded
        const currentValue = price * p.shares;
        const costBasis = p.avgCost * p.shares;
        const pnl = currentValue - costBasis;
        const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
        return { ...p, price, currentValue, costBasis, pnl, pnlPct };
    });

    const totalValue = enriched.reduce((s, p) => s + p.currentValue, 0);
    const totalCost = enriched.reduce((s, p) => s + p.costBasis, 0);
    const totalPnl = totalValue - totalCost;
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    const addPosition = async () => {
        const t = newTicker.trim().toUpperCase();
        if (!t) return;

        setLoadingTicker(true);
        try {
            const res = await fetch(`/api/quote?tickers=${encodeURIComponent(t)}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            const quote = Array.isArray(data) ? data[0] : data;

            if (quote && quote.price) {
                setPositions(p => [...p, { ticker: t, shares: +newShares || 1, avgCost: +newCost || quote.price }]);
                setNewTicker(''); setNewShares(''); setNewCost('');
            } else {
                alert(`Ticker ${t} not found.`);
            }
        } catch (e) {
            alert(`Could not fetch data for ${t}`);
        } finally {
            setLoadingTicker(false);
        }
    };

    const removePosition = (t: string) => setPositions(p => p.filter(x => x.ticker !== t));

    // Allocation slices
    const totalMktCap = enriched.reduce((s, p) => s + p.currentValue, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', padding: 12, gap: 12 }}>
            {/* Header stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <SummaryCard label="TOTAL VALUE" value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <SummaryCard label="TOTAL COST" value={`$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <SummaryCard label="UNREALIZED P&L"
                    value={`${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    color={totalPnl >= 0 ? 'var(--green)' : 'var(--red)'}
                />
                <SummaryCard label="RETURN"
                    value={fmtPct(totalPnlPct)}
                    color={totalPnlPct >= 0 ? 'var(--green)' : 'var(--red)'}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12 }}>
                {/* Positions table */}
                <div className="panel">
                    <div className="panel-header"><span className="panel-title">POSITIONS</span></div>
                    <div style={{ overflow: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>TICKER</th>
                                    <th style={{ textAlign: 'right' }}>SHARES</th>
                                    <th style={{ textAlign: 'right' }}>AVG COST</th>
                                    <th style={{ textAlign: 'right' }}>PRICE</th>
                                    <th style={{ textAlign: 'right' }}>VALUE</th>
                                    <th style={{ textAlign: 'right' }}>P&L</th>
                                    <th style={{ textAlign: 'right' }}>P&L %</th>
                                    <th style={{ textAlign: 'right' }}>WEIGHT</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {enriched.map(p => (
                                    <tr key={p.ticker}>
                                        <td style={{ fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.06em' }}>{p.ticker}</td>
                                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{p.shares}</td>
                                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>${fmt(p.avgCost)}</td>
                                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${fmt(p.price)}</td>
                                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${p.currentValue.toFixed(0)}</td>
                                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: p.pnl >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                                            {p.pnl >= 0 ? '+' : ''}${Math.abs(p.pnl).toFixed(0)}
                                        </td>
                                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: p.pnlPct >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                                            {fmtPct(p.pnlPct)}
                                        </td>
                                        <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                                            {totalMktCap > 0 ? ((p.currentValue / totalMktCap) * 100).toFixed(1) : 0}%
                                        </td>
                                        <td>
                                            <button onClick={() => removePosition(p.ticker)} style={{ color: 'var(--red)', fontSize: 12, opacity: 0.6 }}>×</button>
                                        </td>
                                    </tr>
                                ))}
                                {enriched.length === 0 && (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
                                            No positions yet. Target a stock manually below.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Add position */}
                    <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input value={newTicker} onChange={e => setNewTicker(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && addPosition()}
                            placeholder="TICKER" style={{ width: 70, padding: '4px 8px', fontSize: 11 }} />
                        <input value={newShares} onChange={e => setNewShares(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addPosition()}
                            placeholder="SHARES" type="number" style={{ width: 70, padding: '4px 8px', fontSize: 11 }} />
                        <input value={newCost} onChange={e => setNewCost(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addPosition()}
                            placeholder="AVG COST" type="number" style={{ width: 90, padding: '4px 8px', fontSize: 11 }} />
                        <button onClick={addPosition} disabled={loadingTicker} className="btn btn-amber" style={{ fontSize: 10 }}>
                            {loadingTicker ? 'ADDING...' : '+ ADD'}
                        </button>
                    </div>
                </div>

                {/* Allocation chart */}
                <div className="panel">
                    <div className="panel-header"><span className="panel-title">ALLOCATION</span></div>
                    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {totalMktCap > 0 ? (
                            <AllocationChart positions={enriched} total={totalMktCap} />
                        ) : (
                            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 10 }}>
                                Chart hidden (no value)
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="stat-card">
            <span className="stat-label">{label}</span>
            <span className="stat-value" style={{ color: color ?? 'var(--text-primary)', fontSize: 16 }}>{value}</span>
        </div>
    );
}

const COLORS = ['var(--amber)', 'var(--blue)', 'var(--green)', 'var(--purple)', 'var(--cyan)', 'var(--yellow)', 'var(--red)'];

function AllocationChart({ positions, total }: { positions: { ticker: string; currentValue: number }[]; total: number }) {
    let currentAngle = 0;
    const slices = positions.map((p, i) => {
        const pct = p.currentValue / total;
        const startAngle = currentAngle;
        const endAngle = startAngle + (pct * 360);
        currentAngle = endAngle;
        return { ticker: p.ticker, pct, startAngle, endAngle, color: COLORS[i % COLORS.length] };
    });

    const cx = 80, cy = 80, r = 60, inner = 36;

    const toPath = (start: number, end: number, outer: number, inner: number) => {
        const toRAD = (d: number) => ((d - 90) * Math.PI) / 180;
        const x1 = cx + outer * Math.cos(toRAD(start));
        const y1 = cy + outer * Math.sin(toRAD(start));
        // Avoid perfect circle path issues
        const fixEnd = (end - start) === 360 ? end - 0.01 : end;
        const x2 = cx + outer * Math.cos(toRAD(fixEnd));
        const y2 = cy + outer * Math.sin(toRAD(fixEnd));
        const x3 = cx + inner * Math.cos(toRAD(fixEnd));
        const y3 = cy + inner * Math.sin(toRAD(fixEnd));
        const x4 = cx + inner * Math.cos(toRAD(start));
        const y4 = cy + inner * Math.sin(toRAD(start));
        const lg = fixEnd - start > 180 ? 1 : 0;
        return `M ${x1} ${y1} A ${outer} ${outer} 0 ${lg} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${lg} 0 ${x4} ${y4} Z`;
    };

    return (
        <>
            <svg width={160} height={160} viewBox="0 0 160 160">
                {slices.map((s, i) => (
                    <path key={i} d={toPath(s.startAngle, s.endAngle, r, inner)} fill={s.color} opacity="0.85" />
                ))}
                <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">PORTFOLIO</text>
                <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">
                    {positions.length} STOCKS
                </text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {slices.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: 'var(--text-secondary)', flex: 1 }}>{s.ticker}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                            {(s.pct * 100).toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </>
    );
}
