'use client';
import { useEffect, useRef, useState } from 'react';
import { generateOrderBook, fmt } from '@/lib/marketData';
import { getWsClient } from '@/lib/wsClient';

export default function OrderBook({ ticker, midPrice }: { ticker: string; midPrice: number }) {
    const [book, setBook] = useState(() => generateOrderBook(midPrice));
    const [lastPrice, setLastPrice] = useState(midPrice);

    useEffect(() => {
        const client = getWsClient();
        let counter = 0;
        const unsub = client.subscribe(ticker, ev => {
            setLastPrice(ev.price);
            counter++;
            if (counter % 3 === 0) {
                setBook(generateOrderBook(ev.price));
            }
        });
        return () => unsub();
    }, [ticker, midPrice]);

    const maxTotal = Math.max(
        book.bids[book.bids.length - 1]?.total ?? 1,
        book.asks[book.asks.length - 1]?.total ?? 1
    );

    const asksCopy = [...book.asks].reverse();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="panel-header">
                <span className="panel-title">ORDER BOOK — {ticker}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>BID</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>|</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>ASK</span>
                </div>
            </div>

            {/* Header */}
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

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* ASK side (sells) — top */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse' }}>
                    {asksCopy.map((level, i) => (
                        <BookRow key={i} level={level} side="ask" maxTotal={maxTotal} />
                    ))}
                </div>

                {/* Mid price */}
                <div style={{
                    padding: '6px 8px',
                    background: 'var(--bg-active)',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                    <span style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--amber)' }}>
                        {fmt(lastPrice, lastPrice > 100 ? 2 : 4)}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>LAST</span>
                </div>

                {/* BID side (buys) — bottom */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {book.bids.map((level, i) => (
                        <BookRow key={i} level={level} side="bid" maxTotal={maxTotal} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function BookRow({ level, side, maxTotal }: {
    level: { price: number; size: number; total: number };
    side: 'bid' | 'ask';
    maxTotal: number;
}) {
    const pct = Math.min((level.total / maxTotal) * 100, 100);
    const color = side === 'bid' ? 'var(--green)' : 'var(--red)';

    return (
        <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            padding: '2px 8px',
            position: 'relative',
            fontSize: 11,
            cursor: 'pointer',
        }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
            {/* Background bar */}
            <div style={{
                position: 'absolute',
                [side === 'bid' ? 'left' : 'right']: 0,
                top: 0, bottom: 0,
                width: `${pct}%`,
                background: side === 'bid' ? 'rgba(0,200,83,0.07)' : 'rgba(255,61,61,0.07)',
                pointerEvents: 'none',
            }} />

            <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', zIndex: 1 }}>
                {level.size.toLocaleString()}
            </span>
            <span style={{ textAlign: 'center', color, fontWeight: 600, fontVariantNumeric: 'tabular-nums', zIndex: 1 }}>
                {level.price > 100 ? fmt(level.price) : level.price.toFixed(4)}
            </span>
            <span style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: 10, fontVariantNumeric: 'tabular-nums', zIndex: 1 }}>
                {level.total.toLocaleString()}
            </span>
        </div>
    );
}
