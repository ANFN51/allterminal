'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    analysis?: AIAnalysis;
}

interface AIAnalysis {
    summary: string;
    sentiment_score: number;
    key_risks: string[];
    catalysts: string[];
    price_target: string;
    bull_factors: string[];
    bear_factors: string[];
    technical_outlook: string;
    recommendation: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL';
}

const SUGGESTIONS = [
    'Analyze the impact of the latest Fed rate hike on semiconductors vs Bitcoin',
    'Compare NVDA vs AMD valuation and give a 30-day outlook',
    'What sectors benefit most from AI infrastructure spending?',
    'Assess ETH DeFi ecosystem health and TVL trends',
    'Summarize macro risks for Q2 2026 and their impact on tech stocks',
];

export default function AIAnalyst({ ticker }: { ticker?: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendQuery = async (query: string) => {
        if (!query.trim() || loading) return;
        setInput('');
        setMessages(m => [...m, { role: 'user', content: query }]);
        setLoading(true);

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, context: { ticker } }),
            });
            const analysis: AIAnalysis = await res.json();
            setMessages(m => [...m, { role: 'assistant', content: analysis.summary, analysis }]);
        } catch {
            setMessages(m => [...m, { role: 'assistant', content: 'Error fetching analysis. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const recColor = (r: string) => {
        if (r === 'BUY') return 'var(--green)';
        if (r === 'SELL') return 'var(--red)';
        return 'var(--amber)';
    };

    return (
        <div className="ai-terminal">
            {/* Header */}
            <div style={{
                padding: '10px 16px', background: 'var(--bg-panel-alt)',
                borderBottom: '1px solid var(--border)', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 10,
            }}>
                <div style={{
                    width: 28, height: 28, borderRadius: 4,
                    background: 'var(--amber-muted)', border: '1px solid var(--border-strong)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                }}>⬡</div>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em' }}>AI ANALYST</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Powered by GPT-4o · Multi-asset research assistant</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <span className="tag tag-green">ACTIVE</span>
                    {ticker && <span className="tag tag-amber">CTX: {ticker}</span>}
                </div>
            </div>

            {/* Messages area */}
            <div className="ai-output">
                {messages.length === 0 && (
                    <div style={{ padding: '24px 0' }}>
                        <div style={{ marginBottom: 16, color: 'var(--amber)', fontSize: 14, fontWeight: 600 }}>
                            ⬡ ALLTERMINALS AI ANALYST
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.8 }}>
                            Ask any question about stocks, crypto, macro, or request a multi-asset report.
                            I analyze 100+ indicators including technicals, fundamentals, sentiment, and on-chain data.
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.08em' }}>SUGGESTED QUERIES:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {SUGGESTIONS.map((s, i) => (
                                <button key={i} onClick={() => sendQuery(s)} style={{
                                    textAlign: 'left', padding: '8px 12px',
                                    background: 'var(--bg-panel-alt)', border: '1px solid var(--border)',
                                    borderRadius: 4, color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--amber)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                >
                                    <span style={{ color: 'var(--amber)', marginRight: 8 }}>▸</span>{s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} style={{ marginBottom: 20, animation: 'slideInUp 0.25s ease' }}>
                        {msg.role === 'user' ? (
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                <span style={{ color: 'var(--amber)', fontWeight: 700, flexShrink: 0 }}>YOU ▸</span>
                                <span style={{ color: 'var(--text-primary)' }}>{msg.content}</span>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                    <span style={{ color: 'var(--cyan)', fontWeight: 700, flexShrink: 0 }}>AI ▸</span>
                                    <span style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>{msg.content}</span>
                                </div>
                                {msg.analysis && <AnalysisCard analysis={msg.analysis} recColor={recColor} />}
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', padding: '8px 0' }}>
                        <span style={{ color: 'var(--cyan)' }}>AI ▸</span>
                        <span className="animate-blink">Analyzing market data</span>
                        <LoadingDots />
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="ai-prompt-bar">
                <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: 14 }}>▸</span>
                <input
                    id="ai-input"
                    className="ai-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendQuery(input)}
                    placeholder="Ask the AI Analyst anything about markets, crypto, or macro..."
                    disabled={loading}
                />
                <button
                    onClick={() => sendQuery(input)}
                    disabled={loading || !input.trim()}
                    className="btn btn-amber"
                    style={{ flexShrink: 0 }}
                >
                    {loading ? '…' : 'ANALYZE ↵'}
                </button>
            </div>
        </div>
    );
}

function AnalysisCard({ analysis, recColor }: { analysis: AIAnalysis; recColor: (r: string) => string }) {
    return (
        <div style={{
            background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 6,
            padding: 16, marginLeft: 40,
        }}>
            {/* Rec + Sentiment */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{
                    padding: '8px 20px', borderRadius: 4, fontSize: 18, fontWeight: 800, letterSpacing: '0.1em',
                    background: analysis.recommendation === 'BUY' ? 'rgba(0,200,83,0.15)' : analysis.recommendation === 'SELL' ? 'rgba(255,61,61,0.15)' : 'var(--amber-muted)',
                    border: `2px solid ${recColor(analysis.recommendation)}`,
                    color: recColor(analysis.recommendation),
                }}>{analysis.recommendation}</div>

                <SentimentGauge score={analysis.sentiment_score} />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>PRICE TARGET</div>
                    <div style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 600 }}>{analysis.price_target}</div>
                </div>
            </div>

            {/* Technical */}
            {analysis.technical_outlook && (
                <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--bg-panel-alt)', borderRadius: 4, borderLeft: '2px solid var(--amber)' }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--amber)', marginBottom: 4 }}>TECHNICAL OUTLOOK</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{analysis.technical_outlook}</div>
                </div>
            )}

            {/* Factors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FactorList title="BULL FACTORS" items={analysis.bull_factors} color="var(--green)" icon="▲" />
                <FactorList title="BEAR FACTORS" items={analysis.bear_factors} color="var(--red)" icon="▼" />
                <FactorList title="KEY RISKS" items={analysis.key_risks} color="var(--amber)" icon="⚠" />
            </div>

            {/* Catalysts */}
            {analysis.catalysts?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--cyan)', marginBottom: 6 }}>NEAR-TERM CATALYSTS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {analysis.catalysts.map((c, i) => (
                            <span key={i} className="tag tag-cyan" style={{ fontSize: 10, padding: '3px 8px' }}>{c}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function SentimentGauge({ score }: { score: number }) {
    // Arc from -100 to +100
    const angle = (score / 100) * 90; // degrees from center
    const rad = (angle - 90) * Math.PI / 180;
    const cx = 50, cy = 50, r = 36;
    const needleX = cx + r * 0.8 * Math.cos(rad);
    const needleY = cy + r * 0.8 * Math.sin(rad);
    const color = score > 20 ? 'var(--green)' : score < -20 ? 'var(--red)' : 'var(--amber)';
    const label = score > 60 ? 'EXTREME GREED' : score > 20 ? 'GREED' : score < -60 ? 'EXTREME FEAR' : score < -20 ? 'FEAR' : 'NEUTRAL';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <svg width={100} height={60} viewBox="0 0 100 70">
                {/* Arc */}
                <path d="M 14,55 A 36,36 0 0,1 86,55" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
                <path
                    d={`M 14,55 A 36,36 0 0,1 ${86},55`}
                    fill="none"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--red)" />
                        <stop offset="50%" stopColor="var(--amber)" />
                        <stop offset="100%" stopColor="var(--green)" />
                    </linearGradient>
                </defs>
                {/* Needle */}
                <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={4} fill="white" />
                {/* Score */}
                <text x={50} y={72} textAnchor="middle" fill={color} fontSize="12" fontWeight="700">{score > 0 ? '+' : ''}{score}</text>
            </svg>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color }}>{label}</span>
        </div>
    );
}

function FactorList({ title, items, color, icon }: { title: string; items: string[]; color: string; icon: string }) {
    return (
        <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color, marginBottom: 6 }}>{icon} {title}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items?.map((item, i) => (
                    <li key={i} style={{
                        fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.5,
                        paddingLeft: 10, position: 'relative',
                    }}>
                        <span style={{ position: 'absolute', left: 0, color }}>{icon}</span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function LoadingDots() {
    return (
        <span style={{ display: 'inline-flex', gap: 3 }}>
            {[0, 1, 2].map(i => (
                <span key={i} style={{
                    width: 4, height: 4, borderRadius: '50%', background: 'var(--cyan)',
                    animation: `blink 1s ${i * 0.2}s infinite`,
                    display: 'inline-block',
                }} />
            ))}
        </span>
    );
}
