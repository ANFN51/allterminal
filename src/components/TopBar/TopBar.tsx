'use client';
// Force Next.js HMR recompile
import { useEffect, useState } from 'react';

interface TopBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onTickerSearch: (ticker: string) => void;
}

const TABS = ['MARKETS', 'GLOBAL', 'HEAT MAP', 'STOCKS', 'CRYPTO', 'FOREX', 'BULLION', 'NEWS', 'SENTIMENT', 'AI ANALYST', 'PORTFOLIO'];

export default function TopBar({ activeTab, onTabChange, onTickerSearch }: TopBarProps) {
    const [time, setTime] = useState('');
    const [input, setInput] = useState('');
    const [marketOpen, setMarketOpen] = useState(false);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const h = now.getHours(), m = now.getMinutes();
            setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
            // NYSE open 9:30–16:00 ET weekdays
            const dayOfWeek = now.getDay();
            const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
            const afterOpen = h > 9 || (h === 9 && m >= 30);
            const beforeClose = h < 16;
            setMarketOpen(isWeekday && afterOpen && beforeClose);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            const val = input.trim().toUpperCase();
            onTickerSearch(val);
            setInput('');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
        }}>
            {/* Top row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                gap: 16,
                borderBottom: '1px solid var(--border-subtle)',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <polygon points="11,1 21,6 21,16 11,21 1,16 1,6" fill="none" stroke="var(--amber)" strokeWidth="1.5" />
                        <polygon points="11,5 17,8.5 17,15 11,18.5 5,15 5,8.5" fill="var(--amber)" opacity="0.15" />
                        <line x1="11" y1="5" x2="11" y2="18" stroke="var(--amber)" strokeWidth="1" opacity="0.6" />
                        <line x1="5" y1="8.5" x2="17" y2="15" stroke="var(--amber)" strokeWidth="1" opacity="0.6" />
                        <line x1="17" y1="8.5" x2="5" y2="15" stroke="var(--amber)" strokeWidth="1" opacity="0.6" />
                    </svg>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        color: 'var(--amber)',
                        textTransform: 'uppercase',
                    }}>
                        ALLTERMINALS
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 500 }}>PRO TERMINAL</span>
                </div>

                {/* Search / Command input */}
                <div style={{
                    flex: 1,
                    maxWidth: 560,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border)',
                    borderRadius: 2,
                    padding: '5px 12px',
                }}>
                    <span style={{ color: 'var(--amber)', fontSize: 12, fontWeight: 700 }}>▸</span>
                    <input
                        id="terminal-search"
                        value={input}
                        onChange={e => setInput(e.target.value.toUpperCase())}
                        onKeyDown={handleKeyDown}
                        placeholder="ENTER TICKER OR COMMAND... (e.g. AAPL, BTC, HELP)"
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--amber)',
                            fontSize: 11,
                            letterSpacing: '0.05em',
                            fontFamily: 'var(--font-mono)',
                            outline: 'none',
                        }}
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>↵ GO</span>
                </div>

                {/* Right controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    {/* Status badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StatusPill label="NYSE" active={marketOpen} />
                        <StatusPill label="NASDAQ" active={marketOpen} />
                        <StatusPill label="CRYPTO" active={true} />
                    </div>
                    {/* Clock */}
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '0.05em',
                    }}>{time}</span>
                    {/* Settings */}
                    <button style={{ color: 'var(--text-muted)', fontSize: 16, padding: '2px 4px' }} title="Settings">⚙</button>
                </div>
            </div>

            {/* Tabs row */}
            <div className="tab-bar" style={{ paddingLeft: 8 }}>
                {TABS.map(tab => (
                    <button
                        key={tab}
                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => onTabChange(tab)}
                    >
                        {tab}
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 9, color: 'var(--text-muted)', padding: '0 12px', letterSpacing: '0.08em' }}>
                    v2.0.1 — LIVE
                </span>
            </div>
        </div>
    );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '2px 8px',
            borderRadius: 2,
            background: active ? 'rgba(0,200,83,0.1)' : 'rgba(255,61,61,0.1)',
            border: `1px solid ${active ? 'rgba(0,200,83,0.3)' : 'rgba(255,61,61,0.3)'}`,
        }}>
            <div style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: active ? 'var(--green)' : 'var(--red)',
                animation: active ? 'pulse-amber 2s infinite' : 'none',
                boxShadow: active ? '0 0 6px var(--green)' : 'none',
            }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: active ? 'var(--green)' : 'var(--red)' }}>
                {label}
            </span>
            <span style={{ fontSize: 8, color: active ? 'var(--green)' : 'var(--red)', opacity: 0.7 }}>
                {active ? 'OPEN' : 'CLOSED'}
            </span>
        </div>
    );
}
