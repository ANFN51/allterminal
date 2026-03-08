'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import AuroraCanvas from '@/components/AuroraCanvas';

interface SplashScreenProps {
    onEnter: () => void;
}

const BOOT_LINES = [
    '⬡ ALLTERMINALS v2.0 — INITIALIZING...',
    '  NYSE .............. CONNECTED',
    '  NASDAQ ............. CONNECTED',
    '  CRYPTO MARKETS .... CONNECTED',
    '  AI ANALYST ........ READY',
    '  ✓ ALL SYSTEMS OPERATIONAL',
];

const TICKER = [
    { sym: 'AAPL', chg: '+1.24%', up: true }, { sym: 'MSFT', chg: '+0.87%', up: true },
    { sym: 'NVDA', chg: '+3.12%', up: true }, { sym: 'TSLA', chg: '-2.45%', up: false },
    { sym: 'BTC', chg: '+2.18%', up: true }, { sym: 'ETH', chg: '-0.91%', up: false },
    { sym: 'GOOGL', chg: '+0.65%', up: true }, { sym: 'AMZN', chg: '+1.08%', up: true },
    { sym: 'META', chg: '-0.33%', up: false }, { sym: 'SOL', chg: '+5.71%', up: true },
    { sym: 'SPY', chg: '+0.42%', up: true }, { sym: 'QQQ', chg: '+0.58%', up: true },
];

const FEATURES = [
    { label: 'Real-Time Quotes', sub: 'Live WebSocket prices for 500+ stocks, crypto & forex', icon: '📈' },
    { label: 'Heat Map Universe', sub: 'Mosaic of every US stock by sector, size & momentum', icon: '🌡' },
    { label: 'On-Chain Analytics', sub: 'BTC hash rate, mempool fees, exchange flows', icon: '⛓' },
    { label: 'GPT-4o Analyst', sub: 'Ask anything — get a structured multi-asset report', icon: '🤖' },
    { label: 'Portfolio P&L', sub: 'Real-time gain/loss with benchmark comparison', icon: '💼' },
    { label: 'Global Exchanges', sub: 'London, Tokyo, Shanghai, Frankfurt at your fingertips', icon: '🌐' },
];

/* ─── 3D SVG Objects ─── */
function Bitcoin3D({ size = 90 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <ellipse cx="50" cy="72" rx="42" ry="14" fill="rgba(255,171,0,0.18)" />
            <path d="M8 48 Q8 72 50 72 Q92 72 92 48" fill="url(#bs)" />
            <ellipse cx="50" cy="48" rx="42" ry="14" fill="url(#bt)" />
            <text x="50" y="53" textAnchor="middle" fontSize="18" fontWeight="900" fill="rgba(255,255,255,0.95)" fontFamily="serif">₿</text>
            <defs>
                <radialGradient id="bt" cx="40" cy="40" r="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFD700" /><stop offset="100%" stopColor="#FF8C00" />
                </radialGradient>
                <linearGradient id="bs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E65100" /><stop offset="100%" stopColor="#6D2C00" />
                </linearGradient>
            </defs>
        </svg>
    );
}

function Ethereum3D({ size = 80 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <ellipse cx="50" cy="90" rx="28" ry="8" fill="rgba(100,100,255,0.15)" />
            <path d="M50 8 L78 52 L50 44 Z" fill="url(#el)" />
            <path d="M50 8 L22 52 L50 44 Z" fill="url(#er)" />
            <path d="M50 44 L78 52 L50 90 Z" fill="url(#ebl)" />
            <path d="M50 44 L22 52 L50 90 Z" fill="url(#ebr)" />
            <line x1="22" y1="52" x2="78" y2="52" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
            <defs>
                <linearGradient id="el" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#A084FA" /><stop offset="1" stopColor="#7C3AED" /></linearGradient>
                <linearGradient id="er" x1="1" y1="0" x2="0" y2="1"><stop stopColor="#C4B5FD" /><stop offset="1" stopColor="#8B5CF6" /></linearGradient>
                <linearGradient id="ebl" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5B21B6" /><stop offset="1" stopColor="#2E1065" /></linearGradient>
                <linearGradient id="ebr" x1="1" y1="0" x2="0" y2="1"><stop stopColor="#7C3AED" /><stop offset="1" stopColor="#3B0764" /></linearGradient>
            </defs>
        </svg>
    );
}

function BullCandle({ size = 48 }: { size?: number }) {
    const h = size * 1.8;
    return (
        <svg width={size} height={h} viewBox="0 0 40 72" fill="none">
            <line x1="20" y1="2" x2="20" y2="16" stroke="#00E676" strokeWidth="2" strokeLinecap="round" />
            <rect x="8" y="16" width="24" height="40" rx="2" fill="url(#bg)" />
            <line x1="20" y1="56" x2="20" y2="70" stroke="#00E676" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 16 L38 10 L38 50 L32 56 Z" fill="rgba(0,200,83,0.4)" />
            <path d="M8 16 L14 10 L38 10 L32 16 Z" fill="rgba(0,230,118,0.65)" />
            <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#00E676" /><stop offset="1" stopColor="#00695C" /></linearGradient></defs>
        </svg>
    );
}

function BearCandle({ size = 44 }: { size?: number }) {
    const h = size * 1.8;
    return (
        <svg width={size} height={h} viewBox="0 0 40 72" fill="none">
            <line x1="20" y1="2" x2="20" y2="16" stroke="#FF1744" strokeWidth="2" strokeLinecap="round" />
            <rect x="8" y="16" width="24" height="40" rx="2" fill="url(#rg)" />
            <line x1="20" y1="56" x2="20" y2="70" stroke="#FF1744" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 16 L38 10 L38 50 L32 56 Z" fill="rgba(200,0,50,0.4)" />
            <path d="M8 16 L14 10 L38 10 L32 16 Z" fill="rgba(255,50,80,0.65)" />
            <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#FF5252" /><stop offset="1" stopColor="#B71C1C" /></linearGradient></defs>
        </svg>
    );
}

function PieChart3D({ size = 80 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.9} viewBox="0 0 80 72" fill="none">
            <ellipse cx="40" cy="65" rx="36" ry="10" fill="rgba(0,200,255,0.1)" />
            <path d="M40 32 L40 6 A26 26 0 0 1 64 45 Z" fill="url(#p1)" />
            <path d="M40 32 L64 45 A26 26 0 0 1 32 58 Z" fill="url(#p2)" />
            <path d="M40 32 L32 58 A26 26 0 0 1 16 40 Z" fill="url(#p3)" />
            <path d="M40 32 L16 40 A26 26 0 0 1 40 6 Z" fill="url(#p4)" />
            <path d="M64 45 A26 26 0 0 0 40 6 L40 14 A18 18 0 0 1 58 52 Z" fill="rgba(30,120,200,0.45)" />
            <defs>
                <radialGradient id="p1" cx="60" cy="20" r="60" gradientUnits="userSpaceOnUse"><stop stopColor="#38BDF8" /><stop offset="1" stopColor="#0369A1" /></radialGradient>
                <radialGradient id="p2" cx="70" cy="60" r="50" gradientUnits="userSpaceOnUse"><stop stopColor="#34D399" /><stop offset="1" stopColor="#065F46" /></radialGradient>
                <radialGradient id="p3" cx="20" cy="60" r="50" gradientUnits="userSpaceOnUse"><stop stopColor="#FCD34D" /><stop offset="1" stopColor="#B45309" /></radialGradient>
                <radialGradient id="p4" cx="10" cy="30" r="60" gradientUnits="userSpaceOnUse"><stop stopColor="#A78BFA" /><stop offset="1" stopColor="#4C1D95" /></radialGradient>
            </defs>
        </svg>
    );
}

function GlobeWire({ size = 80 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="34" stroke="rgba(0,229,255,0.45)" strokeWidth="1" />
            <ellipse cx="40" cy="40" rx="20" ry="34" stroke="rgba(0,229,255,0.25)" strokeWidth="0.8" fill="none" />
            <ellipse cx="40" cy="40" rx="34" ry="11" stroke="rgba(0,229,255,0.25)" strokeWidth="0.8" fill="none" />
            <ellipse cx="40" cy="40" rx="34" ry="22" stroke="rgba(0,229,255,0.15)" strokeWidth="0.6" fill="none" />
            <line x1="6" y1="40" x2="74" y2="40" stroke="rgba(0,229,255,0.15)" strokeWidth="0.6" />
            <line x1="40" y1="6" x2="40" y2="74" stroke="rgba(0,229,255,0.15)" strokeWidth="0.6" />
            <circle cx="40" cy="40" r="34" fill="url(#gg)" />
            <defs>
                <radialGradient id="gg" cx="30" cy="30" r="50" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgba(0,229,255,0.1)" /><stop offset="100%" stopColor="transparent" />
                </radialGradient>
            </defs>
        </svg>
    );
}

function TrendUp({ size = 56 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
            <path d="M8 40 L20 26 L30 32 L46 14" stroke="#00E676" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M38 14 L46 14 L46 22" stroke="#00E676" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 40 L20 26 L30 32 L46 14" stroke="#00E676" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
        </svg>
    );
}

/* ─── Aurora canvas is now a shared component ─── */

/* ─── Ticker tape ─── */
function TickerTape() {
    const doubled = [...TICKER, ...TICKER, ...TICKER];
    return (
        <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,10,0.6)', backdropFilter: 'blur(12px)' }}>
            <motion.div animate={{ x: [0, -2400] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'flex', gap: 52, padding: '9px 0', whiteSpace: 'nowrap', width: 'max-content' }}>
                {doubled.map((t, i) => (
                    <span key={i} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>{t.sym}</span>
                        <span style={{ color: t.up ? '#00E676' : '#FF5252', fontWeight: 600 }}>{t.chg}</span>
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

/* ─── Floating object wrapper ─── */
function FloatObj({ children, x, y, delay, dur, blur = 0, scale = 1, spin = false }: { children: React.ReactNode; x: string; y: string; delay: number; dur: number; blur?: number; scale?: number; spin?: boolean; }) {
    return (
        <motion.div
            style={{ position: 'absolute', left: x, top: y, filter: blur ? `blur(${blur}px)` : undefined, transform: `scale(${scale})`, transformOrigin: 'center' }}
            animate={{ y: [0, -20, 0], x: [0, 10, -6, 0], ...(spin ? { rotate: [0, 360] } : {}) }}
            transition={{ y: { duration: dur, repeat: Infinity, ease: 'easeInOut', delay }, x: { duration: dur * 1.4, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 }, ...(spin ? { rotate: { duration: dur * 5, repeat: Infinity, ease: 'linear' } } : {}) }}
        >
            {children}
        </motion.div>
    );
}

/* ─── Feature card ─── */
function FeatureCard({ f, idx }: { f: typeof FEATURES[0]; idx: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px', backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'default' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(255,140,0,0.4)'; el.style.background = 'rgba(255,140,0,0.04)'; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = '0 24px 48px rgba(255,140,0,0.12)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.background = 'rgba(255,255,255,0.025)'; el.style.transform = ''; el.style.boxShadow = ''; }}
        >
            <div style={{ fontSize: 36, marginBottom: 20 }}>{f.icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#FFF', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.label}</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>{f.sub}</p>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'radial-gradient(circle at top right,rgba(255,140,0,0.07),transparent)', pointerEvents: 'none' }} />
        </motion.div>
    );
}

/* ───────────────── HERO (renders after boot, owns scroll) ───────────────── */
function HeroPage({ onEnter }: { onEnter: () => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

    const { scrollYProgress } = useScroll({ container: containerRef });
    const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

    const yFar = useTransform(smooth, [0, 1], ['0%', '-55%']);
    const yMid = useTransform(smooth, [0, 1], ['0%', '-30%']);
    const yNear = useTransform(smooth, [0, 1], ['0%', '-12%']);
    const heroOp = useTransform(smooth, [0, 0.22], [1, 0]);
    const heroSc = useTransform(smooth, [0, 0.22], [1, 0.92]);

    const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    }, []);

    return (
        <div ref={containerRef} style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>

            {/* Aurora bg fixed layer */}
            <div style={{ position: 'sticky', top: 0, height: 0, zIndex: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100vh' }}>
                    <AuroraCanvas tallMode opacity={0.75} />
                </div>
            </div>

            {/* Sticky ticker */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50 }}><TickerTape /></div>

            {/* ── HERO ── */}
            <section onMouseMove={onMove} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 80px', position: 'relative', overflow: 'hidden', zIndex: 10 }}>

                {/* Mouse spotlight */}
                <motion.div
                    animate={{ left: `calc(${mouse.x * 100}% - 300px)`, top: `calc(${mouse.y * 100}% - 300px)` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 28 }}
                    style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle,rgba(255,140,0,0.07) 0%,transparent 66%)', pointerEvents: 'none', borderRadius: '50%' }}
                />

                {/* FAR floating layer */}
                <motion.div style={{ y: yFar, position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
                    <FloatObj x="4%" y="18%" delay={0} dur={9} blur={2} scale={0.7} spin><Bitcoin3D size={90} /></FloatObj>
                    <FloatObj x="87%" y="10%" delay={1.5} dur={11} blur={3} scale={0.6}><Ethereum3D size={72} /></FloatObj>
                    <FloatObj x="77%" y="63%" delay={3} dur={8} blur={2} scale={0.8}><PieChart3D size={80} /></FloatObj>
                </motion.div>

                {/* MID floating layer */}
                <motion.div style={{ y: yMid, position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
                    <FloatObj x="11%" y="52%" delay={2} dur={7} ><BullCandle size={40} /></FloatObj>
                    <FloatObj x="81%" y="38%" delay={0.5} dur={9} ><BearCandle size={34} /></FloatObj>
                    <FloatObj x="28%" y="78%" delay={4} dur={10} blur={1} scale={0.8}><TrendUp size={56} /></FloatObj>
                    <FloatObj x="67%" y="77%" delay={1} dur={8} blur={1} scale={0.7}><GlobeWire size={80} /></FloatObj>
                </motion.div>

                {/* NEAR floating layer */}
                <motion.div style={{ y: yNear, position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
                    <FloatObj x="1%" y="68%" delay={1} dur={6} ><BearCandle size={28} /></FloatObj>
                    <FloatObj x="90%" y="78%" delay={3.5} dur={7} ><BullCandle size={28} /></FloatObj>
                </motion.div>

                {/* Hero text */}
                <motion.div style={{ opacity: heroOp, scale: heroSc, position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 840 }}>

                    {/* Live badge */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 20px', borderRadius: 30, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)', marginBottom: 32 }}>
                        <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                            style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E676', display: 'inline-block', boxShadow: '0 0 8px #00E676' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#A78BFA' }}>ALL MARKETS LIVE · NO SUBSCRIPTION</span>
                    </motion.div>

                    {/* H1 */}
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
                        style={{ fontSize: 'clamp(44px,9vw,88px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.025em', color: '#FFF', margin: '0 0 16px' }}>
                        The Terminal<br />
                        <span style={{ background: 'linear-gradient(90deg,#FF8C00 0%,#FF2D55 38%,#A020F0 70%,#00E5FF 100%)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                            Wall Street Uses.
                        </span>
                    </motion.h1>

                    {/* Sub */}
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.35 }}
                        style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', margin: '0 auto 44px', fontWeight: 300, maxWidth: 600 }}>
                        Real-time stocks · crypto · heat maps · on-chain analytics · GPT‑4o AI
                        <br />— all in one terminal. <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Free, forever.</strong>
                    </motion.p>

                    {/* CTAs */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
                        style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
                        <button id="enter-terminal-btn" onClick={onEnter}
                            style={{ padding: '16px 56px', background: 'linear-gradient(135deg,#FF8C00,#FF2D55)', color: '#FFF', border: 'none', borderRadius: 50, fontSize: 15, fontWeight: 800, letterSpacing: '0.08em', cursor: 'pointer', boxShadow: '0 8px 32px rgba(255,45,85,0.4)', transition: 'all 0.3s ease', fontFamily: 'var(--font-ui)' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(255,45,85,0.65)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,45,85,0.4)'; }}>
                            ⚡ LAUNCH TERMINAL
                        </button>
                        <button onClick={() => containerRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                            style={{ padding: '16px 40px', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 50, fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer', backdropFilter: 'blur(12px)', transition: 'all 0.3s ease', fontFamily: 'var(--font-ui)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}>
                            SEE FEATURES ↓
                        </button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                        style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {[['500+', 'Stocks'], ['100+', 'Crypto'], ['<300ms', 'Latency'], ['GPT-4o', 'AI Engine']].map(([v, l], i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#FFF' }}>{v}</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', marginTop: 4, fontWeight: 700 }}>{l}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll hint */}
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                    style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)' }}>SCROLL TO EXPLORE</span>
                    <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                        <path d="M2 2 L10 10 L18 2" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.div>
            </section>

            {/* ── FEATURES ── */}
            <section style={{ padding: '120px 24px', position: 'relative', zIndex: 10 }}>
                <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
                    style={{ textAlign: 'center', marginBottom: 72 }}>
                    <p style={{ fontSize: 12, letterSpacing: '0.3em', color: '#7C3AED', fontWeight: 700, marginBottom: 16 }}>PLATFORM SUITE</p>
                    <h2 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 900, color: '#FFF', lineHeight: 1.15 }}>
                        Built for the obsessed.<br />
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>Not the amateurs.</span>
                    </h2>
                </motion.div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, maxWidth: 1080, margin: '0 auto' }}>
                    {FEATURES.map((f, i) => <FeatureCard key={i} f={f} idx={i} />)}
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section style={{ padding: '120px 24px 180px', position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, type: 'spring' }}
                    style={{ maxWidth: 700, margin: '0 auto', padding: '72px 48px', background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 32, backdropFilter: 'blur(32px)', boxShadow: '0 40px 120px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '50%', height: 2, background: 'linear-gradient(90deg,transparent,#FF8C00,#A020F0,transparent)' }} />
                    <div style={{ fontSize: 52, marginBottom: 24 }}>⚡</div>
                    <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#FFF', marginBottom: 16, lineHeight: 1.2 }}>READY TO TRADE SMARTER?</h2>
                    <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 400, margin: '0 auto 40px', lineHeight: 1.7 }}>Zero subscriptions. Zero delays. Bloomberg-level intelligence — yours, now.</p>
                    <button onClick={onEnter}
                        style={{ padding: '18px 72px', background: 'linear-gradient(135deg,#FF8C00,#FF2D55,#A020F0)', color: '#FFF', border: 'none', borderRadius: 50, fontSize: 16, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-ui)', boxShadow: '0 12px 48px rgba(160,32,240,0.4)', transition: 'all 0.3s ease' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(160,32,240,0.65)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 12px 48px rgba(160,32,240,0.4)'; }}>
                        ENTER TERMINAL
                    </button>
                    <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em' }}>MARKET DATA MAY BE DELAYED · NOT FINANCIAL ADVICE</div>
                </motion.div>
            </section>
        </div>
    );
}

/* ───────────────── ROOT EXPORT ───────────────── */
export default function SplashScreen({ onEnter }: SplashScreenProps) {
    const [phase, setPhase] = useState<'boot' | 'hero'>('boot');
    const [bootLines, setBootLines] = useState<string[]>([]);

    useEffect(() => {
        let i = 0;
        const id = setInterval(() => {
            setBootLines(l => [...l, BOOT_LINES[i] ?? '']);
            i++;
            if (i >= BOOT_LINES.length) { clearInterval(id); setTimeout(() => setPhase('hero'), 500); }
        }, 140);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#050510', fontFamily: 'var(--font-ui)' }}>
            <AnimatePresence>
                {phase === 'boot' && (
                    <motion.div key="boot" exit={{ opacity: 0, scale: 1.06, filter: 'blur(14px)' }} transition={{ duration: 0.9 }}
                        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                        <AuroraCanvas tallMode opacity={0.75} />
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            style={{ maxWidth: 540, width: '100%', background: 'rgba(5,5,20,0.88)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '36px 40px', backdropFilter: 'blur(24px)', boxShadow: '0 0 80px rgba(124,58,237,0.18), inset 0 1px 0 rgba(255,255,255,0.06)', position: 'relative', zIndex: 10 }}>
                            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#7C3AED', marginBottom: 24, fontWeight: 700 }}>ALLTERMINALS v2.0 — SYSTEM BOOT</div>
                            {bootLines.map((line, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        fontSize: 13, lineHeight: 2.1, fontFamily: 'var(--font-mono)', fontWeight: line.includes('✓') || line.includes('⬡') ? 700 : 400,
                                        color: line.includes('✓') ? '#00E676' : line.includes('CONNECTED') || line.includes('READY') ? '#00E5FF' : line.startsWith('⬡') ? '#FF8C00' : 'rgba(255,255,255,0.5)'
                                    }}>
                                    {line || ' '}
                                </motion.div>
                            ))}
                            <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} style={{ color: '#FF8C00', fontSize: 16 }}>█</motion.span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {phase === 'hero' && <HeroPage onEnter={onEnter} />}
        </div>
    );
}
