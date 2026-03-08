'use client';
import { useEffect, useRef, useState } from 'react';

interface Peer {
    ticker: string;
    name: string;
    marketCap: number;
    changePct: number;
    pe: number;
    revenueGrowth: number;
    relationship: 'direct' | 'indirect' | 'partner';
}

const ECOSYSTEM: Record<string, { sector: string; peers: Peer[] }> = {
    AAPL: {
        sector: 'Consumer Technology', peers: [
            { ticker: 'MSFT', name: 'Microsoft', marketCap: 3.08e12, changePct: 0.82, pe: 32.4, revenueGrowth: 17.6, relationship: 'direct' },
            { ticker: 'GOOGL', name: 'Alphabet', marketCap: 2.06e12, changePct: -0.81, pe: 21.5, revenueGrowth: 13.4, relationship: 'direct' },
            { ticker: 'META', name: 'Meta', marketCap: 1.36e12, changePct: 1.62, pe: 25.8, revenueGrowth: 22.1, relationship: 'indirect' },
            { ticker: 'AMZN', name: 'Amazon', marketCap: 2.09e12, changePct: 2.20, pe: 38.2, revenueGrowth: 12.5, relationship: 'indirect' },
            { ticker: 'QCOM', name: 'Qualcomm', marketCap: 166e9, changePct: 0.54, pe: 14.2, revenueGrowth: 8.3, relationship: 'partner' },
        ]
    },
    NVDA: {
        sector: 'Semiconductors', peers: [
            { ticker: 'AMD', name: 'AMD', marketCap: 266e9, changePct: 1.42, pe: 45.1, revenueGrowth: 22.3, relationship: 'direct' },
            { ticker: 'INTC', name: 'Intel', marketCap: 91e9, changePct: -1.82, pe: 18.2, revenueGrowth: -3.4, relationship: 'direct' },
            { ticker: 'QCOM', name: 'Qualcomm', marketCap: 166e9, changePct: 0.54, pe: 14.2, revenueGrowth: 8.3, relationship: 'direct' },
            { ticker: 'MSFT', name: 'Microsoft', marketCap: 3.08e12, changePct: 0.82, pe: 32.4, revenueGrowth: 17.6, relationship: 'partner' },
            { ticker: 'AMZN', name: 'Amazon', marketCap: 2.09e12, changePct: 2.20, pe: 38.2, revenueGrowth: 12.5, relationship: 'partner' },
        ]
    },
    MSFT: {
        sector: 'Enterprise Software', peers: [
            { ticker: 'GOOGL', name: 'Alphabet', marketCap: 2.06e12, changePct: -0.81, pe: 21.5, revenueGrowth: 13.4, relationship: 'direct' },
            { ticker: 'AMZN', name: 'Amazon', marketCap: 2.09e12, changePct: 2.20, pe: 38.2, revenueGrowth: 12.5, relationship: 'direct' },
            { ticker: 'AAPL', name: 'Apple', marketCap: 3.36e12, changePct: -0.43, pe: 28.1, revenueGrowth: 9.8, relationship: 'direct' },
            { ticker: 'CRM', name: 'Salesforce', marketCap: 280e9, changePct: 0.21, pe: 42.3, revenueGrowth: 10.2, relationship: 'direct' },
            { ticker: 'NVDA', name: 'NVIDIA', marketCap: 2.16e12, changePct: -1.39, pe: 65.4, revenueGrowth: 122.4, relationship: 'partner' },
        ]
    },
};

const FALLBACK_PEERS: Peer[] = [
    { ticker: 'MSFT', name: 'Microsoft', marketCap: 3.08e12, changePct: 0.82, pe: 32.4, revenueGrowth: 17.6, relationship: 'direct' },
    { ticker: 'GOOGL', name: 'Alphabet', marketCap: 2.06e12, changePct: -0.81, pe: 21.5, revenueGrowth: 13.4, relationship: 'direct' },
    { ticker: 'META', name: 'Meta', marketCap: 1.36e12, changePct: 1.62, pe: 25.8, revenueGrowth: 22.1, relationship: 'indirect' },
];

interface CompetitorMapProps {
    ticker: string;
    price: number;
    marketCap: number;
    pe: number;
    revenueGrowth: number;
    onSelectTicker?: (t: string) => void;
}

const REL_COLOR: Record<string, string> = {
    direct: 'var(--red)',
    indirect: 'var(--amber)',
    partner: 'var(--cyan)',
};

export default function CompetitorMap({ ticker, price, marketCap, pe, revenueGrowth, onSelectTicker }: CompetitorMapProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [dims, setDims] = useState({ w: 600, h: 340 });
    const [hoveredPeer, setHoveredPeer] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'marketCap' | 'pe' | 'revenueGrowth'>('marketCap');

    const ecosystem = ECOSYSTEM[ticker] ?? { sector: 'Technology', peers: FALLBACK_PEERS };
    const peers = ecosystem.peers;

    useEffect(() => {
        const el = svgRef.current?.parentElement;
        if (!el) return;
        const ro = new ResizeObserver(([e]) => {
            setDims({ w: e.contentRect.width, h: e.contentRect.height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const cx = dims.w / 2;
    const cy = dims.h / 2;
    const orbitR = Math.min(dims.w, dims.h) * 0.34;

    // Node radius proportional to market cap
    const maxCap = Math.max(marketCap, ...peers.map(p => p.marketCap));
    const nodeSize = (cap: number) => Math.max(16, Math.min(52, (cap / maxCap) * 52));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel-alt)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em' }}>COMPETITOR ECOSYSTEM MAP</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>— {ecosystem.sector}</span>
                    <div style={{ flex: 1 }} />
                    <div style={{ display: 'flex', gap: 6 }}>
                        {(['marketCap', 'pe', 'revenueGrowth'] as const).map(k => (
                            <button key={k} onClick={() => setSortBy(k)}
                                className={`btn ${sortBy === k ? 'btn-amber' : 'btn-ghost'}`}
                                style={{ padding: '2px 8px', fontSize: 9 }}>
                                {k === 'marketCap' ? 'MKT CAP' : k === 'pe' ? 'P/E' : 'REV. GROWTH'}
                            </button>
                        ))}
                    </div>
                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 10 }}>
                        {Object.entries(REL_COLOR).map(([rel, col]) => (
                            <span key={rel} style={{ fontSize: 9, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ display: 'inline-block', width: 20, height: 1.5, background: col, opacity: 0.8 }} />
                                {rel.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Graph + Table split */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* SVG orbit graph */}
                <div style={{ flex: '0 0 55%', position: 'relative', background: 'var(--bg-void)' }}>
                    <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
                        <defs>
                            <radialGradient id="centerGlow" cx="50%" cy="50%">
                                <stop offset="0%" stopColor="rgba(255,140,0,0.25)" />
                                <stop offset="100%" stopColor="rgba(255,140,0,0)" />
                            </radialGradient>
                        </defs>

                        {/* Orbit ring */}
                        <circle cx={cx} cy={cy} r={orbitR}
                            fill="none" stroke="rgba(255,140,0,0.07)" strokeWidth="1" strokeDasharray="4 6" />

                        {/* Lines from center to peers */}
                        {peers.map((peer, i) => {
                            const angle = (i / peers.length) * 2 * Math.PI - Math.PI / 2;
                            const px = cx + orbitR * Math.cos(angle);
                            const py = cy + orbitR * Math.sin(angle);
                            const isHov = hoveredPeer === peer.ticker;
                            return (
                                <line key={peer.ticker}
                                    x1={cx} y1={cy} x2={px} y2={py}
                                    stroke={REL_COLOR[peer.relationship]}
                                    strokeWidth={isHov ? 2 : 0.8}
                                    strokeDasharray={peer.relationship === 'partner' ? '4 4' : 'none'}
                                    opacity={isHov ? 0.9 : 0.35}
                                    style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }}
                                />
                            );
                        })}

                        {/* Center node (subject ticker) */}
                        <circle cx={cx} cy={cy} r={nodeSize(marketCap) + 6} fill="url(#centerGlow)" />
                        <circle cx={cx} cy={cy} r={nodeSize(marketCap)}
                            fill="rgba(255,140,0,0.15)" stroke="var(--amber)" strokeWidth="2" />
                        <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--amber)" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">{ticker}</text>
                        <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">
                            ${(marketCap / 1e12).toFixed(2)}T
                        </text>

                        {/* Peer nodes */}
                        {peers.map((peer, i) => {
                            const angle = (i / peers.length) * 2 * Math.PI - Math.PI / 2;
                            const px = cx + orbitR * Math.cos(angle);
                            const py = cy + orbitR * Math.sin(angle);
                            const r = nodeSize(peer.marketCap);
                            const isHov = hoveredPeer === peer.ticker;
                            const isPos = peer.changePct >= 0;

                            return (
                                <g key={peer.ticker}
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={() => setHoveredPeer(peer.ticker)}
                                    onMouseLeave={() => setHoveredPeer(null)}
                                    onClick={() => onSelectTicker?.(peer.ticker)}
                                >
                                    <circle cx={px} cy={py} r={r + (isHov ? 4 : 0)}
                                        fill={isPos ? 'rgba(0,200,83,0.1)' : 'rgba(255,61,61,0.1)'}
                                        stroke={REL_COLOR[peer.relationship]}
                                        strokeWidth={isHov ? 2 : 1}
                                        style={{ transition: 'r 0.2s' }}
                                    />
                                    <text x={px} y={py - 3} textAnchor="middle" fill="var(--text-primary)" fontSize={Math.max(9, Math.min(12, r * 0.7))} fontWeight="700" fontFamily="var(--font-mono)">{peer.ticker}</text>
                                    <text x={px} y={py + 11} textAnchor="middle" fill={isPos ? 'var(--green)' : 'var(--red)'} fontSize="9" fontFamily="var(--font-mono)">
                                        {isPos ? '+' : ''}{peer.changePct.toFixed(1)}%
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Comparison table */}
                <div style={{ flex: 1, overflow: 'auto', borderLeft: '1px solid var(--border)' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>TICKER</th>
                                <th style={{ textAlign: 'right' }}>MKT CAP</th>
                                <th style={{ textAlign: 'right' }}>P/E</th>
                                <th style={{ textAlign: 'right' }}>REV %</th>
                                <th style={{ textAlign: 'right' }}>24H%</th>
                                <th style={{ textAlign: 'center' }}>TYPE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Subject row */}
                            <tr style={{ background: 'var(--amber-muted)' }}>
                                <td style={{ color: 'var(--amber)', fontWeight: 700 }}>{ticker} ★</td>
                                <td style={{ textAlign: 'right' }}>${(marketCap / 1e12).toFixed(2)}T</td>
                                <td style={{ textAlign: 'right' }}>{pe.toFixed(1)}x</td>
                                <td style={{ textAlign: 'right', color: revenueGrowth >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                    {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                                </td>
                                <td style={{ textAlign: 'right' }}>—</td>
                                <td style={{ textAlign: 'center' }}><span className="tag tag-amber">SUBJECT</span></td>
                            </tr>

                            {[...peers].sort((a, b) => {
                                if (sortBy === 'marketCap') return b.marketCap - a.marketCap;
                                if (sortBy === 'pe') return b.pe - a.pe;
                                return b.revenueGrowth - a.revenueGrowth;
                            }).map(peer => (
                                <tr key={peer.ticker}
                                    style={{ background: hoveredPeer === peer.ticker ? 'var(--bg-hover)' : 'transparent', cursor: 'pointer' }}
                                    onMouseEnter={() => setHoveredPeer(peer.ticker)}
                                    onMouseLeave={() => setHoveredPeer(null)}
                                    onClick={() => onSelectTicker?.(peer.ticker)}
                                >
                                    <td style={{ color: 'var(--amber)', fontWeight: 600 }}>{peer.ticker}</td>
                                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                        ${peer.marketCap >= 1e12 ? `${(peer.marketCap / 1e12).toFixed(2)}T` : `${(peer.marketCap / 1e9).toFixed(0)}B`}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>{peer.pe.toFixed(1)}x</td>
                                    <td style={{ textAlign: 'right', color: peer.revenueGrowth >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                                        {peer.revenueGrowth >= 0 ? '+' : ''}{peer.revenueGrowth.toFixed(1)}%
                                    </td>
                                    <td style={{ textAlign: 'right', color: peer.changePct >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                                        {peer.changePct >= 0 ? '+' : ''}{peer.changePct.toFixed(2)}%
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`tag ${peer.relationship === 'direct' ? 'tag-red' : peer.relationship === 'partner' ? 'tag-cyan' : 'tag-amber'}`} style={{ fontSize: 9 }}>
                                            {peer.relationship.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
