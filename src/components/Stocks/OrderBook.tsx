'use client';
import { fmt } from '@/lib/marketData';

export default function OrderBook({ ticker, midPrice }: { ticker: string; midPrice: number }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)' }}>
            <div className="panel-header">
                <span className="panel-title">ORDER BOOK — {ticker}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>BID</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>|</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>ASK</span>
                </div>
            </div>

            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                padding: '4px 8px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-panel-alt)',
                fontSize: 9, fontWeight: 600, letterSpacing: '0.1em',
                color: 'var(--text-muted)', textTransform: 'uppercase',
            }}>
                <span>SIZE</span>
                <span style={{ textAlign: 'center' }}>PRICE</span>
                <span style={{ textAlign: 'right' }}>TOTAL</span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
                <span style={{ fontSize: 32, marginBottom: 12 }}>🔒</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em', marginBottom: 4 }}>
                    LEVEL 2 DATA UNAVAILABLE
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.5 }}>
                    Real-time order book depth for <strong style={{ color: 'var(--text-primary)' }}>{ticker}</strong> requires a premium institutional data feed subscription.
                </span>
            </div>

            <div style={{
                padding: '6px 8px',
                background: 'var(--bg-active)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
                <span style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--amber)' }}>
                    {fmt(midPrice, midPrice > 100 ? 2 : 4)}
                </span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>LAST MID</span>
            </div>
        </div>
    );
}
