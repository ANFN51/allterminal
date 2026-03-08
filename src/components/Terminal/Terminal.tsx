'use client';
import { useState } from 'react';
import TopBar from '../TopBar/TopBar';
import TickerStrip from '../TickerStrip/TickerStrip';
import MarketsOverview from '../Markets/MarketsOverview';
import GlobalMarketsPanel from '../Markets/GlobalMarketsPanel';
import HeatMap from '../HeatMap/HeatMap';
import StockDetail from '../Stocks/StockDetail';
import CryptoDashboard from '../Crypto/CryptoDashboard';
import ExchangeFlows from '../Crypto/ExchangeFlows';
import AIAnalyst from '../AI/AIAnalyst';
import SentimentEngine from '../AI/SentimentEngine';
import Portfolio from '../Portfolio/Portfolio';
import ForexDashboard from '../Forex/ForexDashboard';
import { STOCKS } from '@/lib/marketData';

type Tab = 'MARKETS' | 'GLOBAL' | 'HEAT MAP' | 'STOCKS' | 'CRYPTO' | 'FOREX' | 'SENTIMENT' | 'AI ANALYST' | 'PORTFOLIO';

const WATCHLIST = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META', 'AMZN', 'TSLA', 'JPM', 'AMD', 'V', 'MA', 'UNH', 'JNJ', 'XOM', 'GS'];
const CRYPTO_TICKERS = new Set(['BTC', 'ETH', 'SOL', 'DOGE', 'XRP', 'ADA', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE', 'DOT', 'SHIB', 'LTC', 'NEAR', 'ATOM', 'TON', 'ICP', 'APT', 'ARB']);

export default function Terminal() {
    const [activeTab, setActiveTab] = useState<Tab>('MARKETS');
    const [selectedTicker, setSelectedTicker] = useState('AAPL');
    const [heatMapMode, setHeatMapMode] = useState<'stocks' | 'crypto'>('stocks');
    const [cryptoSubTab, setCryptoSubTab] = useState<'dashboard' | 'flows'>('dashboard');

    const handleTickerSearch = (ticker: string) => {
        setSelectedTicker(ticker);
        if (CRYPTO_TICKERS.has(ticker)) {
            setActiveTab('CRYPTO');
        } else {
            setActiveTab('STOCKS');
        }
    };

    return (
        <div className="terminal-root">
            <TopBar
                activeTab={activeTab}
                onTabChange={t => setActiveTab(t as Tab)}
                onTickerSearch={handleTickerSearch}
            />
            <TickerStrip />

            <div className="terminal-content" style={{ flex: 1, overflow: 'hidden' }}>
                {/* ── US MARKETS ── */}
                {activeTab === 'MARKETS' && (
                    <MarketsOverview onSelectTicker={t => { setSelectedTicker(t); setActiveTab('STOCKS'); }} />
                )}

                {/* ── GLOBAL MARKETS ── */}
                {activeTab === 'GLOBAL' && <GlobalMarketsPanel />}

                {/* ── HEAT MAP ── */}
                {activeTab === 'HEAT MAP' && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em', marginRight: 8 }}>MAP TYPE</span>
                            <button className={`btn ${heatMapMode === 'stocks' ? 'btn-amber' : 'btn-ghost'}`} onClick={() => setHeatMapMode('stocks')}>🗺 US STOCK MARKET</button>
                            <button className={`btn ${heatMapMode === 'crypto' ? 'btn-amber' : 'btn-ghost'}`} onClick={() => setHeatMapMode('crypto')}>⬡ CRYPTO MARKET</button>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <HeatMap mode={heatMapMode} onSelect={t => { setSelectedTicker(t); setActiveTab('STOCKS'); }} />
                        </div>
                    </div>
                )}

                {/* ── STOCKS ── */}
                {activeTab === 'STOCKS' && (
                    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
                        <div style={{ flex: 1, overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
                            <StockDetail ticker={selectedTicker} />
                        </div>
                        {/* Watchlist sidebar */}
                        <div style={{ width: 150, background: 'var(--bg-surface)', overflow: 'auto', flexShrink: 0 }}>
                            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                                WATCHLIST
                            </div>
                            {WATCHLIST.map(t => {
                                const s = STOCKS[t];
                                if (!s) return null;
                                return (
                                    <div key={t} onClick={() => setSelectedTicker(t)}
                                        style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', background: selectedTicker === t ? 'var(--amber-muted)' : 'transparent', transition: 'background 0.1s' }}
                                        onMouseEnter={e => { if (selectedTicker !== t) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                        onMouseLeave={e => { if (selectedTicker !== t) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: selectedTicker === t ? 'var(--amber)' : 'var(--text-primary)' }}>{t}</span>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: s.changePct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                                {s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>${s.price.toFixed(2)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── CRYPTO ── */}
                {activeTab === 'CRYPTO' && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', gap: 6, padding: '6px 12px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                            <button className={`btn ${cryptoSubTab === 'dashboard' ? 'btn-amber' : 'btn-ghost'}`} style={{ fontSize: 10 }} onClick={() => setCryptoSubTab('dashboard')}>⬡ CRYPTO DASHBOARD</button>
                            <button className={`btn ${cryptoSubTab === 'flows' ? 'btn-amber' : 'btn-ghost'}`} style={{ fontSize: 10 }} onClick={() => setCryptoSubTab('flows')}>🔄 EXCHANGE FLOWS</button>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            {cryptoSubTab === 'dashboard' ? <CryptoDashboard /> : <ExchangeFlows />}
                        </div>
                    </div>
                )}

                {/* ── FOREX ── */}
                {activeTab === 'FOREX' && <ForexDashboard />}

                {/* ── SENTIMENT ENGINE ── */}
                {activeTab === 'SENTIMENT' && <SentimentEngine />}

                {/* ── AI ANALYST ── */}
                {activeTab === 'AI ANALYST' && (
                    <AIAnalyst ticker={selectedTicker !== 'AAPL' ? selectedTicker : undefined} />
                )}

                {/* ── PORTFOLIO ── */}
                {activeTab === 'PORTFOLIO' && <Portfolio />}
            </div>

            {/* Status bar */}
            <div style={{ height: 22, background: 'var(--bg-void)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 12px', flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: 'var(--amber)', fontWeight: 600, letterSpacing: '0.1em' }}>⬡ ALLTERMINALS PRO</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 4px var(--green)' }} />
                    WS: LIVE
                </span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>CoinGecko: CONNECTED</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>ECB Forex: LIVE</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>blockchain.info: LIVE</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>NYSE · NASDAQ · LSE · TSE · HKEX · CRYPTO · FOREX</span>
                <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>DATA MAY BE DELAYED. NOT FINANCIAL ADVICE.</span>
            </div>
        </div>
    );
}
