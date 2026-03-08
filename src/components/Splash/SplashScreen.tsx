'use client';
import { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
    onEnter: () => void;
}

const FEATURES = [
    { icon: '⬡', title: 'Real-Time Market Data', desc: 'Live prices via WebSocket — stocks, crypto, indices, forex' },
    { icon: '🗺', title: 'Visual Market Maps', desc: 'Interactive heat maps of the entire US stock market & crypto universe' },
    { icon: '🐋', title: 'On-Chain Intelligence', desc: 'TVL, protocol revenue, whale tracking, exchange inflows & outflows' },
    { icon: '⚡', title: 'AI Analyst', desc: 'Natural language queries return multi-asset reports with sentiment scoring' },
    { icon: '📊', title: 'Competitor Mapping', desc: 'Auto-generate peer comparison tables with 10+ fundamental metrics' },
    { icon: '💼', title: 'Portfolio Tracker', desc: 'Real-time P&L, allocation analysis, and benchmark comparison' },
];

const STATS = [
    { value: '500+', label: 'Stocks Tracked' },
    { value: '100+', label: 'Crypto Assets' },
    { value: '<300ms', label: 'Data Latency' },
    { value: 'GPT-4o', label: 'AI Engine' },
];

export default function SplashScreen({ onEnter }: SplashScreenProps) {
    const [phase, setPhase] = useState<'boot' | 'hero' | 'ready'>('boot');
    const [bootLines, setBootLines] = useState<string[]>([]);
    const [scrollY, setScrollY] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Hex grid background animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frame = 0;
        let animId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const drawHex = (x: number, y: number, size: number, alpha: number, fill = false) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3 - Math.PI / 6;
                const px = x + size * Math.cos(angle);
                const py = y + size * Math.sin(angle);
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            if (fill) {
                ctx.fillStyle = `rgba(255,140,0,${alpha * 0.15})`;
                ctx.fill();
            }
            ctx.strokeStyle = `rgba(255,140,0,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame++;

            const hexSize = 40;
            const hexW = hexSize * Math.sqrt(3);
            const hexH = hexSize * 2;
            const cols = Math.ceil(canvas.width / hexW) + 2;
            const rows = Math.ceil(canvas.height / (hexH * 0.75)) + 2;

            for (let row = -1; row < rows; row++) {
                for (let col = -1; col < cols; col++) {
                    const x = col * hexW + (row % 2 === 0 ? 0 : hexW / 2);
                    const y = row * hexH * 0.75;
                    const dist = Math.sqrt((x - canvas.width / 2) ** 2 + (y - canvas.height / 2) ** 2);
                    const wave = Math.sin(dist / 120 - frame / 60) * 0.5 + 0.5;
                    const alpha = wave * 0.12 + 0.02;
                    const filled = wave > 0.85;
                    drawHex(x, y, hexSize - 2, alpha, filled);
                }
            }

            animId = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    // Boot sequence
    const BOOT_SEQUENCE = [
        '⬡ ALLTERMINALS v2.0 — INITIALIZING...',
        '  [▓▓▓▓▓▓░░░░] Loading market data feeds...',
        '  [▓▓▓▓▓▓▓▓░░] Connecting WebSocket streams...',
        '  [▓▓▓▓▓▓▓▓▓░] Calibrating AI inference engine...',
        '  [▓▓▓▓▓▓▓▓▓▓] Synchronizing CoinGecko API...',
        '',
        '  NYSE .............. CONNECTED',
        '  NASDAQ ............. CONNECTED',
        '  CRYPTO MARKETS .... CONNECTED',
        '  AI ANALYST ........ READY',
        '',
        '  ✓ ALL SYSTEMS OPERATIONAL',
    ];

    useEffect(() => {
        let i = 0;
        const id = setInterval(() => {
            setBootLines(lines => [...lines, BOOT_SEQUENCE[i] ?? '']);
            i++;
            if (i >= BOOT_SEQUENCE.length) {
                clearInterval(id);
                setTimeout(() => setPhase('hero'), 600);
            }
        }, 120);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll listener
    useEffect(() => {
        if (phase !== 'hero') return;
        const el = containerRef.current;
        if (!el) return;
        const onScroll = () => setScrollY(el.scrollTop);
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, [phase]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'var(--bg-void)',
            fontFamily: 'var(--font-mono)',
        }}>
            {/* Animated hex background */}
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

            {/* Boot phase */}
            {phase === 'boot' && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 40,
                }}>
                    <div style={{
                        maxWidth: 600, width: '100%',
                        background: 'rgba(8,9,13,0.95)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 4,
                        padding: '24px 28px',
                        boxShadow: '0 0 60px rgba(255,140,0,0.1)',
                    }}>
                        {bootLines.map((line, i) => (
                            <div key={i} style={{
                                fontSize: 12, lineHeight: 1.8,
                                color: line.includes('✓') ? 'var(--green)'
                                    : line.includes('CONNECTED') || line.includes('READY') ? 'var(--cyan)'
                                        : line.startsWith('⬡') ? 'var(--amber)'
                                            : 'var(--text-secondary)',
                                fontWeight: line.startsWith('⬡') ? 700 : 400,
                                animation: 'fadeIn 0.15s ease',
                            }}>{line || '\u00A0'}</div>
                        ))}
                        {phase === 'boot' && (
                            <span style={{ color: 'var(--amber)', fontSize: 14 }} className="animate-blink">█</span>
                        )}
                    </div>
                </div>
            )}

            {/* Hero + scroll sections */}
            {phase !== 'boot' && (
                <div
                    ref={containerRef}
                    style={{ height: '100vh', overflowY: 'auto', scrollBehavior: 'smooth', position: 'relative' }}
                >
                    {/* Hero section */}
                    <section style={{
                        minHeight: '100vh',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        padding: '60px 40px',
                        position: 'relative',
                        textAlign: 'center',
                    }}>
                        {/* Ambient glow */}
                        <div style={{
                            position: 'absolute', top: '40%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 600, height: 600,
                            background: 'radial-gradient(circle, rgba(255,140,0,0.06) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }} />

                        {/* Logo mark */}
                        <div style={{
                            marginBottom: 32,
                            animation: 'slideInUp 0.8s ease',
                        }}>
                            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="animate-pulse-amber">
                                <polygon points="36,4 68,20 68,52 36,68 4,52 4,20"
                                    fill="none" stroke="var(--amber)" strokeWidth="2" />
                                <polygon points="36,14 58,26 58,50 36,62 14,50 14,26"
                                    fill="rgba(255,140,0,0.08)" />
                                <polygon points="36,24 48,31 48,45 36,52 24,45 24,31"
                                    fill="rgba(255,140,0,0.15)" stroke="var(--amber)" strokeWidth="1" />
                                <circle cx="36" cy="36" r="4" fill="var(--amber)" />
                                <line x1="36" y1="14" x2="36" y2="62" stroke="var(--amber)" strokeWidth="0.8" opacity="0.4" />
                                <line x1="14" y1="26" x2="58" y2="50" stroke="var(--amber)" strokeWidth="0.8" opacity="0.4" />
                                <line x1="58" y1="26" x2="14" y2="50" stroke="var(--amber)" strokeWidth="0.8" opacity="0.4" />
                            </svg>
                        </div>

                        {/* Title */}
                        <h1 style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'clamp(36px, 6vw, 72px)',
                            fontWeight: 800,
                            letterSpacing: '0.15em',
                            color: 'var(--amber)',
                            margin: '0 0 8px',
                            textTransform: 'uppercase',
                            textShadow: '0 0 40px rgba(255,140,0,0.3)',
                            animation: 'slideInUp 0.8s 0.1s ease both',
                        }}>
                            ALLTERMINALS
                        </h1>
                        <div style={{
                            fontSize: 13,
                            letterSpacing: '0.3em',
                            color: 'var(--text-muted)',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            marginBottom: 28,
                            animation: 'slideInUp 0.8s 0.2s ease both',
                        }}>
                            PROFESSIONAL FINANCIAL TERMINAL
                        </div>

                        {/* Tagline */}
                        <p style={{
                            maxWidth: 560,
                            fontSize: 16,
                            lineHeight: 1.8,
                            color: 'var(--text-secondary)',
                            marginBottom: 48,
                            animation: 'slideInUp 0.8s 0.3s ease both',
                        }}>
                            The power of Bloomberg. The intelligence of AI. <br />
                            Real-time markets, visual heat maps, on-chain crypto analytics, <br />
                            and a natural language AI analyst — unified in one terminal.
                        </p>

                        {/* Stats bar */}
                        <div style={{
                            display: 'flex', gap: 0,
                            background: 'rgba(255,140,0,0.05)',
                            border: '1px solid var(--border)',
                            borderRadius: 4,
                            marginBottom: 48,
                            overflow: 'hidden',
                            animation: 'slideInUp 0.8s 0.4s ease both',
                        }}>
                            {STATS.map((s, i) => (
                                <div key={i} style={{
                                    padding: '16px 32px',
                                    borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--amber)', fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div style={{
                            display: 'flex', gap: 12,
                            animation: 'slideInUp 0.8s 0.5s ease both',
                        }}>
                            <button
                                id="enter-terminal-btn"
                                onClick={onEnter}
                                style={{
                                    padding: '14px 40px',
                                    background: 'var(--amber)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: 2,
                                    fontSize: 13,
                                    fontWeight: 800,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 0 24px rgba(255,140,0,0.4)',
                                    fontFamily: 'var(--font-mono)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 32px rgba(255,140,0,0.6)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 0 24px rgba(255,140,0,0.4)';
                                }}
                            >
                                ⬡ LAUNCH TERMINAL
                            </button>
                            <button
                                onClick={() => containerRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                                style={{
                                    padding: '14px 32px',
                                    background: 'transparent',
                                    color: 'var(--amber)',
                                    border: '1px solid var(--border-strong)',
                                    borderRadius: 2,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: 'var(--font-mono)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'var(--amber-muted)';
                                    e.currentTarget.style.borderColor = 'var(--amber)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                                }}
                            >
                                LEARN MORE ↓
                            </button>
                        </div>

                        {/* Scroll hint */}
                        <div style={{
                            position: 'absolute', bottom: 32,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                            animation: 'fadeIn 1s 1s ease both',
                        }}>
                            <span style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-dim)' }}>SCROLL TO EXPLORE</span>
                            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--amber-dim), transparent)' }} />
                        </div>
                    </section>

                    {/* Features section */}
                    <section style={{
                        minHeight: '100vh',
                        padding: '80px 40px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        background: 'linear-gradient(to bottom, var(--bg-void), var(--bg-base))',
                    }}>
                        <div style={{ maxWidth: 900, width: '100%' }}>
                            <div style={{
                                textAlign: 'center', marginBottom: 60,
                                opacity: scrollY > 100 ? 1 : 0,
                                transform: scrollY > 100 ? 'translateY(0)' : 'translateY(20px)',
                                transition: 'all 0.6s ease',
                            }}>
                                <div style={{ fontSize: 10, letterSpacing: '0.25em', color: 'var(--amber)', marginBottom: 12, fontWeight: 600 }}>PLATFORM OVERVIEW</div>
                                <h2 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                                    Everything a professional<br />
                                    <span style={{ color: 'var(--amber)' }}>trader needs</span>, in one place.
                                </h2>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: 16,
                            }}>
                                {FEATURES.map((f, i) => (
                                    <FeatureCard key={i} feature={f} index={i} scrollY={scrollY} />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Final CTA section */}
                    <section style={{
                        minHeight: '60vh',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--bg-base)',
                        borderTop: '1px solid var(--border)',
                        padding: 40,
                        textAlign: 'center',
                    }}>
                        <div style={{
                            opacity: scrollY > 500 ? 1 : 0,
                            transform: scrollY > 500 ? 'translateY(0)' : 'translateY(24px)',
                            transition: 'all 0.6s 0.1s ease',
                        }}>
                            <div style={{ fontSize: 36, marginBottom: 16 }}>⬡</div>
                            <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--amber)', marginBottom: 12, letterSpacing: '0.1em' }}>
                                READY TO TRADE SMARTER?
                            </h2>
                            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 400 }}>
                                Real-time data. AI-powered insights. No subscriptions required.
                            </p>
                            <button
                                onClick={onEnter}
                                style={{
                                    padding: '16px 56px',
                                    background: 'var(--amber)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: 2,
                                    fontSize: 14,
                                    fontWeight: 800,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    boxShadow: '0 0 40px rgba(255,140,0,0.5)',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                ENTER TERMINAL →
                            </button>
                            <div style={{ marginTop: 20, fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
                                MARKET DATA MAY BE DELAYED · NOT FINANCIAL ADVICE
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

function FeatureCard({ feature, index, scrollY }: { feature: typeof FEATURES[0]; index: number; scrollY: number }) {
    const threshold = 250 + index * 40;
    const visible = scrollY > threshold;

    return (
        <div style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '20px 22px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(28px)',
            transition: `all 0.5s ${index * 0.07}s ease`,
            cursor: 'default',
        }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)';
                (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-panel-alt)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-panel)';
            }}
        >
            <div style={{ fontSize: 28, marginBottom: 12 }}>{feature.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', marginBottom: 8, letterSpacing: '0.06em' }}>
                {feature.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {feature.desc}
            </div>
        </div>
    );
}
