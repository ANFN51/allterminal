'use client';
import { useState } from 'react';

interface PortfolioLandingProps {
    onSetupManual: () => void;
}

export default function PortfolioLanding({ onSetupManual }: PortfolioLandingProps) {
    const [connecting, setConnecting] = useState(false);

    const handleConnectClick = () => {
        setConnecting(true);
        // Simulate a brief connection delay before showing the "Coming Soon" toast
        setTimeout(() => setConnecting(false), 800);
        // We'll just reset it for now, since it's a placeholder. 
        // In a real app, this would trigger a modal or wallet provider sequence.
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', padding: '24px',
            background: 'radial-gradient(circle at 50% -20%, rgba(20,23,32,0.6) 0%, transparent 80%)'
        }}>
            <div className="panel" style={{
                maxWidth: 480, width: '100%',
                padding: '40px 32px',
                textAlign: 'center',
                boxShadow: '0 16px 64px rgba(0,0,0,0.5), 0 0 40px rgba(255,153,0,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderTop: '1px solid rgba(255,255,255,0.15)'
            }}>
                <div style={{ marginBottom: 24 }}>
                    <svg width="60" height="60" viewBox="0 0 72 72" fill="none" style={{ margin: '0 auto', filter: 'drop-shadow(0 4px 12px rgba(255,153,0,0.3))' }}>
                        <polygon points="36,4 68,20 68,52 36,68 4,52 4,20" fill="rgba(255,153,0,0.1)" stroke="var(--amber)" strokeWidth="1.5" />
                        <line x1="36" y1="4" x2="36" y2="68" stroke="var(--amber)" strokeWidth="0.5" opacity="0.3" />
                        <line x1="4" y1="20" x2="68" y2="52" stroke="var(--amber)" strokeWidth="0.5" opacity="0.3" />
                        <line x1="68" y1="20" x2="4" y2="52" stroke="var(--amber)" strokeWidth="0.5" opacity="0.3" />
                        <circle cx="36" cy="36" r="12" fill="var(--amber-gradient)" />
                    </svg>
                </div>

                <h2 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 24, fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'var(--text-primary)',
                    margin: '0 0 12px 0'
                }}>
                    PRO PORTFOLIO
                </h2>

                <p style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 14, lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    marginBottom: 36,
                    padding: '0 12px'
                }}>
                    Track your multi-asset holdings with institutional-grade tools.
                    Real-time P&L, allocation analysis, and benchmark tracking.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button
                        onClick={onSetupManual}
                        className="btn btn-amber"
                        style={{ padding: '14px 20px', fontSize: 13, height: 48, letterSpacing: '0.12em' }}
                    >
                        + CREATE MANUAL PORTFOLIO
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0', opacity: 0.5 }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    <button
                        onClick={handleConnectClick}
                        className="btn btn-ghost"
                        style={{ padding: '14px 20px', fontSize: 13, height: 48, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        {connecting ? (
                            <span className="animate-pulse">CONNECTING...</span>
                        ) : (
                            <>🔗 CONNECT BROKER / WALLET</>
                        )}
                    </button>
                    {connecting && (
                        <div style={{ fontSize: 10, color: 'var(--amber)', marginTop: 4, animation: 'fadeIn 0.3s ease' }}>
                            Brokerage integrations coming soon in Q4.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
