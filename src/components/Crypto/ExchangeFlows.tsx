'use client';
import { useEffect, useState } from 'react';

interface FlowData {
    exchange: string;
    inflow: number;   // BTC equivalent
    outflow: number;
    netFlow: number;
    change24h: number;
    icon: string;
}

interface ExchangeFlow {
    timestamp: number;
    net: number;
}

const EXCHANGES: FlowData[] = [
    { exchange: 'Binance', inflow: 12840, outflow: 11320, netFlow: 1520, change24h: 8.4, icon: '🟡' },
    { exchange: 'Coinbase', inflow: 8420, outflow: 9840, netFlow: -1420, change24h: -4.2, icon: '🔵' },
    { exchange: 'OKX', inflow: 6180, outflow: 5820, netFlow: 360, change24h: 2.1, icon: '⚫' },
    { exchange: 'Bybit', inflow: 4320, outflow: 3980, netFlow: 340, change24h: 3.8, icon: '🟠' },
    { exchange: 'Kraken', inflow: 2840, outflow: 3210, netFlow: -370, change24h: -5.6, icon: '🟣' },
    { exchange: 'HTX', inflow: 1920, outflow: 1680, netFlow: 240, change24h: 1.4, icon: '🔴' },
];

const WHALE_ALERTS = [
    { time: '5m ago', amount: 2480, from: 'Unknown Wallet', to: 'Binance', direction: 'in' as const },
    { time: '12m ago', amount: 842, from: 'Coinbase', to: 'Unknown', direction: 'out' as const },
    { time: '18m ago', amount: 1200, from: 'Unknown Wallet', to: 'OKX', direction: 'in' as const },
    { time: '31m ago', amount: 650, from: 'Bybit', to: 'Unknown', direction: 'out' as const },
    { time: '44m ago', amount: 3200, from: 'Unknown Wallet', to: 'Binance', direction: 'in' as const },
    { time: '1h ago', amount: 480, from: 'Unknown', to: 'Kraken', direction: 'in' as const },
];

function generateFlowHistory(): ExchangeFlow[] {
    const now = Math.floor(Date.now() / 1000);
    const data: ExchangeFlow[] = [];
    let cumulative = 0;
    for (let i = 72; i >= 0; i--) {
        const net = (Math.sin(i * 0.31 + 2.1) * 800) + (Math.random() - 0.5) * 600;
        cumulative += net;
        data.push({ timestamp: now - i * 3600, net: Math.round(net) });
    }
    return data;
}

export default function ExchangeFlows() {
    const [flows] = useState(EXCHANGE_FLOW_CACHE);
    const [tab, setTab] = useState<'overview' | 'whale' | 'history'>('overview');

    const totalInflow = EXCHANGES.reduce((s, e) => s + e.inflow, 0);
    const totalOutflow = EXCHANGES.reduce((s, e) => s + e.outflow, 0);
    const netTotal = totalInflow - totalOutflow;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel-alt)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em' }}>EXCHANGE FLOWS</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>BTC — 24H ROLLING</span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: netTotal >= 0 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
                        NET: {netTotal >= 0 ? '+' : ''}{netTotal.toLocaleString()} BTC
                    </span>
                    <span className={`tag ${netTotal >= 0 ? 'tag-red' : 'tag-green'}`}>
                        {netTotal >= 0 ? 'EXCHANGE BUYING' : 'EXCHANGE SELLING'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {(['overview', 'whale', 'history'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`btn ${tab === t ? 'btn-amber' : 'btn-ghost'}`}
                            style={{ padding: '2px 10px', fontSize: 9, textTransform: 'uppercase' }}>
                            {t === 'overview' ? '📊 OVERVIEW' : t === 'whale' ? '🐋 WHALE ALERTS' : '📈 24H HISTORY'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary stats */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <SummaryCell label="TOTAL INFLOW" value={`${totalInflow.toLocaleString()} BTC`} color="var(--red)" />
                <SummaryCell label="TOTAL OUTFLOW" value={`${totalOutflow.toLocaleString()} BTC`} color="var(--green)" />
                <SummaryCell label="NET EXCHANGE" value={`${netTotal >= 0 ? '+' : ''}${netTotal.toLocaleString()} BTC`} color={netTotal >= 0 ? 'var(--red)' : 'var(--green)'} />
                <SummaryCell label="USD EQUIV" value={`$${((Math.abs(netTotal) * 87420) / 1e9).toFixed(2)}B`} color="var(--amber)" />
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                {tab === 'overview' && (
                    <div>
                        {/* Flow bar chart */}
                        <div style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 12 }}>INFLOW vs OUTFLOW BY EXCHANGE</div>
                            {EXCHANGES.map(ex => (
                                <ExchangeBar key={ex.exchange} data={ex} totalInflow={totalInflow} />
                            ))}
                        </div>

                        {/* Exchange table */}
                        <table>
                            <thead>
                                <tr>
                                    <th>EXCHANGE</th>
                                    <th style={{ textAlign: 'right' }}>INFLOW (BTC)</th>
                                    <th style={{ textAlign: 'right' }}>OUTFLOW (BTC)</th>
                                    <th style={{ textAlign: 'right' }}>NET</th>
                                    <th style={{ textAlign: 'right' }}>24H Δ</th>
                                    <th style={{ textAlign: 'right' }}>SIGNAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {EXCHANGES.map(ex => (
                                    <tr key={ex.exchange}>
                                        <td style={{ fontWeight: 600 }}><span style={{ marginRight: 6 }}>{ex.icon}</span>{ex.exchange}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{ex.inflow.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>{ex.outflow.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: ex.netFlow >= 0 ? 'var(--red)' : 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
                                            {ex.netFlow >= 0 ? '+' : ''}{ex.netFlow.toLocaleString()}
                                        </td>
                                        <td style={{ textAlign: 'right', color: ex.change24h >= 0 ? 'var(--red)' : 'var(--green)' }}>
                                            {ex.change24h >= 0 ? '+' : ''}{ex.change24h.toFixed(1)}%
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className={`tag ${ex.netFlow >= 200 ? 'tag-red' : ex.netFlow <= -200 ? 'tag-green' : 'tag-amber'}`} style={{ fontSize: 9 }}>
                                                {ex.netFlow >= 200 ? 'BUY PRESSURE' : ex.netFlow <= -200 ? 'SELL PRESSURE' : 'NEUTRAL'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'whale' && (
                    <div style={{ padding: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 12 }}>REAL-TIME WHALE ALERTS (BTC ≥ $40M)</div>
                        {WHALE_ALERTS.map((w, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                                background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4,
                                marginBottom: 8, animation: 'slideInUp 0.2s ease',
                            }}>
                                <span style={{ fontSize: 20 }}>🐋</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{w.from}</span>
                                        <span style={{ color: 'var(--amber)', margin: '0 6px' }}>→</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{w.to}</span>
                                    </div>
                                    <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>{w.time}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: w.direction === 'in' ? 'var(--red)' : 'var(--green)' }}>
                                        {w.direction === 'in' ? '⬆ ' : '⬇ '}{w.amount.toLocaleString()} BTC
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                        ${((w.amount * 87420) / 1e6).toFixed(0)}M
                                    </div>
                                </div>
                                <span className={`tag ${w.direction === 'in' ? 'tag-red' : 'tag-green'}`}>
                                    {w.direction === 'in' ? 'EXCHANGE IN' : 'EXCHANGE OUT'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'history' && (
                    <div style={{ padding: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 12 }}>72-HOUR NET EXCHANGE FLOW (BTC)</div>
                        <FlowChart data={flows} />
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryCell({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div style={{ flex: 1, padding: '10px 14px', borderRight: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        </div>
    );
}

function ExchangeBar({ data, totalInflow }: { data: FlowData; totalInflow: number }) {
    const inflowPct = (data.inflow / totalInflow) * 100;
    const outflowPct = (data.outflow / totalInflow) * 100;
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{data.icon} {data.exchange}</span>
                <span style={{ fontSize: 10, color: data.netFlow >= 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                    {data.netFlow >= 0 ? '+' : ''}{data.netFlow.toLocaleString()} BTC
                </span>
            </div>
            <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: 'var(--bg-surface)', gap: 1 }}>
                <div style={{ width: `${inflowPct}%`, background: 'rgba(255,61,61,0.7)', transition: 'width 0.5s' }} />
                <div style={{ width: `${outflowPct}%`, background: 'rgba(0,200,83,0.7)', transition: 'width 0.5s' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
                <span style={{ fontSize: 9, color: 'var(--red)' }}>IN: {data.inflow.toLocaleString()}</span>
                <span style={{ fontSize: 9, color: 'var(--green)' }}>OUT: {data.outflow.toLocaleString()}</span>
            </div>
        </div>
    );
}

function FlowChart({ data }: { data: ExchangeFlow[] }) {
    const maxAbs = Math.max(...data.map(d => Math.abs(d.net)));
    const w = 100, h = 80;

    return (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, padding: 12, overflow: 'hidden' }}>
            <svg width="100%" height={160} viewBox={`0 0 ${data.length * 4} ${h}`} preserveAspectRatio="none">
                {/* Zero line */}
                <line x1={0} y1={h / 2} x2={data.length * 4} y2={h / 2} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                {/* Bars */}
                {data.map((d, i) => {
                    const barH = Math.max(1, (Math.abs(d.net) / maxAbs) * (h / 2 - 4));
                    const isPos = d.net >= 0;
                    return (
                        <rect key={i}
                            x={i * 4} y={isPos ? h / 2 - barH : h / 2}
                            width={3} height={barH}
                            fill={isPos ? 'rgba(255,61,61,0.7)' : 'rgba(0,200,83,0.7)'}
                        />
                    );
                })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>72 HOURS AGO</span>
                <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>NOW</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <span style={{ fontSize: 9, color: 'var(--red)' }}>■ Inflow (bearish)</span>
                <span style={{ fontSize: 9, color: 'var(--green)' }}>■ Outflow (bullish)</span>
            </div>
        </div>
    );
}

const EXCHANGE_FLOW_CACHE = generateFlowHistory();
