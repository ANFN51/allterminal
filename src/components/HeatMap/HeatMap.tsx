'use client';
import { useEffect, useRef, useState } from 'react';
import { HEATMAP_STOCKS } from '@/lib/marketData';
import { MOCK_CRYPTO } from '@/lib/coinGecko';

interface HeatMapProps {
    mode: 'stocks' | 'crypto';
    onSelect?: (ticker: string) => void;
}

// Color scale: red → grey → green based on % change
function pctColor(pct: number): string {
    const clamped = Math.max(-5, Math.min(5, pct));
    if (clamped >= 0) {
        const intensity = clamped / 5;
        const r = Math.floor(0 + (1 - intensity) * 30);
        const g = Math.floor(150 + intensity * 55);
        const b = Math.floor(0 + (1 - intensity) * 30);
        return `rgb(${r},${g},${b})`;
    } else {
        const intensity = Math.abs(clamped) / 5;
        const r = Math.floor(180 + intensity * 75);
        const g = Math.floor(20 - intensity * 20);
        const b = Math.floor(20 - intensity * 20);
        return `rgb(${r},${g},${b})`;
    }
}

interface Cell {
    ticker: string;
    name: string;
    sector: string;
    marketCap: number;
    changePct: number;
}

export default function HeatMap({ mode, onSelect }: HeatMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [cells, setCells] = useState<Cell[]>([]);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; cell: Cell } | null>(null);
    const [sizeBy, setSizeBy] = useState<'marketCap'>('marketCap');
    const [filter, setFilter] = useState<string>('ALL');
    const [dims, setDims] = useState<{ width: number; height: number } | null>(null);

    useEffect(() => {
        if (mode === 'stocks') {
            setCells(HEATMAP_STOCKS.map(s => ({
                ticker: s.ticker.replace(/[0-9]/g, ''),
                name: s.name, sector: s.sector,
                marketCap: s.marketCap, changePct: s.changePct,
            })));
        } else {
            setCells(MOCK_CRYPTO.map(c => ({
                ticker: c.symbol.toUpperCase(),
                name: c.name, sector: c.category,
                marketCap: c.market_cap, changePct: c.price_change_percentage_24h,
            })));
        }
    }, [mode]);

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setDims({ width, height });
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    // Sector list
    const sectors = ['ALL', ...Array.from(new Set(cells.map(c => c.sector)))];
    const filtered = filter === 'ALL' ? cells : cells.filter(c => c.sector === filter);

    // Treemap layout (simple squarify)
    const layout = dims ? computeTreemap(filtered, dims.width, dims.height, sizeBy) : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Controls */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                background: 'var(--bg-panel-alt)', borderBottom: '1px solid var(--border)',
                flexWrap: 'wrap', flexShrink: 0,
            }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>
                    {mode === 'stocks' ? 'MARKET MAP' : 'CRYPTO MAP'}
                </span>
                <div style={{ height: 14, width: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>SIZE:</span>
                {(['marketCap'] as const).map(b => (
                    <button key={b} className={`btn ${sizeBy === b ? 'btn-amber' : 'btn-ghost'}`}
                        style={{ padding: '2px 8px', fontSize: 9 }} onClick={() => setSizeBy(b)}>
                        MKT CAP
                    </button>
                ))}
                <div style={{ height: 14, width: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>SECTOR:</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {sectors.slice(0, 10).map(s => (
                        <button key={s} className={`btn ${filter === s ? 'btn-amber' : 'btn-ghost'}`}
                            style={{ padding: '2px 8px', fontSize: 9 }} onClick={() => setFilter(s)}>
                            {s}
                        </button>
                    ))}
                </div>
                <div style={{ flex: 1 }} />
                {/* Color legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 9, color: 'var(--red)' }}>−5%</span>
                    <div style={{ width: 80, height: 8, borderRadius: 2, background: 'linear-gradient(90deg, #cc0000, #444, #00c853)' }} />
                    <span style={{ fontSize: 9, color: 'var(--green)' }}>+5%</span>
                </div>
            </div>

            {/* Map area */}
            <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {layout.map((item, i) => {
                    const w = item.x2 - item.x1;
                    const h = item.y2 - item.y1;
                    const showText = w > 40 && h > 28;
                    const showChange = w > 50 && h > 42;
                    const fontSize = Math.max(9, Math.min(14, w / 6));

                    return (
                        <div
                            key={i}
                            className="heatmap-cell"
                            style={{
                                position: 'absolute',
                                left: item.x1 + 1, top: item.y1 + 1,
                                width: w - 2, height: h - 2,
                                background: pctColor(item.cell.changePct),
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                            }}
                            onClick={() => onSelect?.(item.cell.ticker)}
                            onMouseEnter={e => {
                                const rect = containerRef.current?.getBoundingClientRect();
                                if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, cell: item.cell });
                            }}
                            onMouseMove={e => {
                                const rect = containerRef.current?.getBoundingClientRect();
                                if (rect) setTooltip(t => t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
                            }}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            {showText && (
                                <span style={{ fontSize, fontWeight: 700, color: 'rgba(255,255,255,0.95)', textShadow: '0 1px 3px rgba(0,0,0,0.8)', lineHeight: 1.2 }}>
                                    {item.cell.ticker}
                                </span>
                            )}
                            {showChange && (
                                <span style={{ fontSize: Math.max(9, fontSize - 2), color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                    {item.cell.changePct >= 0 ? '+' : ''}{item.cell.changePct.toFixed(2)}%
                                </span>
                            )}
                        </div>
                    );
                })}

                {/* Tooltip */}
                {tooltip && (
                    <div className="tooltip" style={{
                        left: Math.min(tooltip.x + 12, (dims?.width ?? 600) - 180),
                        top: Math.min(tooltip.y + 12, (dims?.height ?? 400) - 120),
                    }}>
                        <div style={{ fontWeight: 700, color: 'var(--amber)', marginBottom: 4, fontSize: 13 }}>{tooltip.cell.ticker}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 6 }}>{tooltip.cell.name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>24H CHG</span>
                            <span style={{ fontWeight: 700, color: tooltip.cell.changePct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                {tooltip.cell.changePct >= 0 ? '+' : ''}{tooltip.cell.changePct.toFixed(2)}%
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 3 }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>MKT CAP</span>
                            <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11 }}>
                                {tooltip.cell.marketCap >= 1e12 ? `$${(tooltip.cell.marketCap / 1e12).toFixed(2)}T`
                                    : `$${(tooltip.cell.marketCap / 1e9).toFixed(1)}B`}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 3 }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>SECTOR</span>
                            <span style={{ fontSize: 10, color: 'var(--cyan)' }}>{tooltip.cell.sector}</span>
                        </div>
                        <div style={{ marginTop: 6, fontSize: 9, color: 'var(--text-muted)' }}>Click to analyze</div>
                    </div>
                )}

                {layout.length === 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        Loading map…
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple slice-and-dice treemap algorithm
interface Rect { x1: number; y1: number; x2: number; y2: number; cell: Cell }

function computeTreemap(cells: Cell[], width: number, height: number, _sizeBy: 'marketCap'): Rect[] {
    if (!cells.length || width <= 0 || height <= 0) return [];

    const total = cells.reduce((s, c) => s + c.marketCap, 0);
    const sorted = [...cells].sort((a, b) => b.marketCap - a.marketCap);

    const rects: Rect[] = [];
    layout(sorted, 0, 0, width, height, total, rects);
    return rects;
}

function layout(cells: Cell[], x1: number, y1: number, x2: number, y2: number, total: number, out: Rect[]) {
    if (!cells.length) return;
    if (cells.length === 1) {
        out.push({ x1, y1, x2, y2, cell: cells[0] });
        return;
    }

    const w = x2 - x1;
    const h = y2 - y1;
    const isHoriz = w >= h;

    let sumA = 0;
    let i = 0;
    const half = total / 2;
    while (i < cells.length - 1 && sumA + cells[i].marketCap < half) {
        sumA += cells[i].marketCap;
        i++;
    }
    sumA += cells[i].marketCap;
    i++;

    const groupA = cells.slice(0, i);
    const groupB = cells.slice(i);
    const ratioA = sumA / total;

    if (isHoriz) {
        const splitX = x1 + w * ratioA;
        layout(groupA, x1, y1, splitX, y2, sumA, out);
        layout(groupB, splitX, y1, x2, y2, total - sumA, out);
    } else {
        const splitY = y1 + h * ratioA;
        layout(groupA, x1, y1, x2, splitY, sumA, out);
        layout(groupB, x1, splitY, x2, y2, total - sumA, out);
    }
}
