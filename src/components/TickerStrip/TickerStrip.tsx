'use client';
import { useEffect, useRef, useState } from 'react';
import { INDICES } from '@/lib/marketData';
import { getWsClient } from '@/lib/wsClient';

interface IndexPrice {
    ticker: string;
    name: string;
    price: number;
    changePct: number;
}

export default function TickerStrip() {
    const [prices, setPrices] = useState<IndexPrice[]>(INDICES);
    const [flashed, setFlashed] = useState<Record<string, 'up' | 'down' | null>>({});
    const prevRef = useRef<Record<string, number>>({});

    useEffect(() => {
        const client = getWsClient();
        const tickers = ['SPY', 'QQQ', 'BTC', 'ETH', 'SOL'];
        const unsubs = tickers.map(t =>
            client.subscribe(t, ev => {
                const prev = prevRef.current[t] ?? ev.price;
                const dir = ev.price >= prev ? 'up' : 'down';
                const changePctBase = INDICES.find(i => i.ticker === t)?.changePct ?? 0;

                setPrices(p => p.map(i =>
                    i.ticker === t ? { ...i, price: ev.price } : i
                ));
                setFlashed(f => ({ ...f, [t]: dir }));
                prevRef.current[t] = ev.price;
                setTimeout(() => setFlashed(f => ({ ...f, [t]: null })), 400);
            })
        );
        return () => unsubs.forEach(u => u());
    }, []);

    const items = [...prices, ...prices]; // duplicate for seamless loop

    return (
        <div style={{
            height: 32,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                animation: 'marquee 60s linear infinite',
                whiteSpace: 'nowrap',
            }}>
                {items.map((idx, i) => (
                    <span
                        key={i}
                        className={`ticker-item ${flashed[idx.ticker] === 'up' ? 'price-flash-up' : flashed[idx.ticker] === 'down' ? 'price-flash-down' : ''}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 18px', borderRight: '1px solid var(--border)' }}
                    >
                        <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em' }}>{idx.ticker}</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11, color: 'var(--text-primary)' }}>
                            {idx.price.toLocaleString('en-US', { minimumFractionDigits: idx.price > 999 ? 0 : 2, maximumFractionDigits: idx.price > 999 ? 0 : 2 })}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: idx.changePct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                            {idx.changePct >= 0 ? '▲' : '▼'} {Math.abs(idx.changePct).toFixed(2)}%
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}
