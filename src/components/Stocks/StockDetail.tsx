'use client';
import { useState, useEffect } from 'react';
import { fmt, fmtBig, fmtPct } from '@/lib/marketData';
import stockUniverse from '@/lib/stockUniverse';
import CandlestickChart from '../Charts/CandlestickChart';
import OrderBook from './OrderBook';
import CompetitorMap from './CompetitorMap';

interface StockDetailProps {
    ticker: string;
}

const TABS = ['CHART', 'FUNDAMENTALS', 'ORDER BOOK', 'ECO MAP', 'EDGAR'];

export default function StockDetail({ ticker }: StockDetailProps) {
    const [tab, setTab] = useState('CHART');
    const [stock, setStock] = useState<any>(null);
    const [competitors, setCompetitors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoading(true);
            setError(false);
            try {
                // Find target metadata
                const allMeta = [...stockUniverse.SP500_COMPACT, ...stockUniverse.GLOBAL_COMPACT];
                let meta = allMeta.find(m => m[0] === ticker);
                const name = meta ? meta[1] : ticker;
                const sector = meta ? meta[2] : 'Unknown';

                // Find competitors metadata
                const compMeta = allMeta
                    .filter(m => m[2] === sector && m[0] !== ticker)
                    .slice(0, 5);
                const compTickers = compMeta.map(m => m[0]);

                const fetchTickers = [ticker, ...compTickers];
                const res = await fetch(`/api/quote?tickers=${encodeURIComponent(fetchTickers.join(','))}`);
                if (!res.ok) throw new Error('API failed');

                const data = await res.json();
                const quotes = Array.isArray(data) ? data : [data];

                const mainQuote = quotes.find(q => q.ticker === ticker);
                if (!mainQuote) throw new Error('Not found');

                const mappedCompetitors = compMeta.map(m => {
                    const q = quotes.find(quote => quote.ticker === m[0]);
                    return {
                        ticker: m[0],
                        name: m[1],
                        sector: m[2],
                        price: q?.price || 0,
                        changePct: q?.changePct || 0,
                        marketCap: q?.marketCap || 0,
                        pe: q?.pe || null
                    };
                }).filter(c => c.price > 0).sort((a, b) => b.marketCap - a.marketCap);

                if (active) {
                    setStock({
                        ticker,
                        name,
                        sector,
                        price: mainQuote.price || 0,
                        change: mainQuote.regularMarketChange || (mainQuote.price * (mainQuote.changePct / 100) || 0),
                        changePct: mainQuote.changePct || 0,
                        marketCap: mainQuote.marketCap || 0,
                        pe: mainQuote.pe || null,
                        eps: mainQuote.eps || null,
                        dividend: mainQuote.dividend || 0,
                        week52High: mainQuote.week52High || mainQuote.price * 1.2,
                        week52Low: mainQuote.week52Low || mainQuote.price * 0.8
                    });
                    setCompetitors(mappedCompetitors);
                    setLoading(false);
                }
            } catch (err) {
                if (active) {
                    setError(true);
                    setLoading(false);
                }
            }
        };
        load();
        return () => { active = false; };
    }, [ticker]);

    if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--amber)' }}>Loading {ticker} data...</div>;
    }

    if (error || !stock) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 13 }}>
                <span>Ticker <span style={{ color: 'var(--amber)' }}>{ticker}</span> market data unavailable.</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{
                background: 'var(--bg-panel-alt)',
                borderBottom: '1px solid var(--border)',
                padding: '12px 16px',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 10 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em' }}>{stock.ticker}</span>
                            <span className={`tag ${stock.changePct >= 0 ? 'tag-green' : 'tag-red'}`}>
                                {stock.changePct >= 0 ? '▲' : '▼'} {Math.abs(stock.changePct).toFixed(2)}%
                            </span>
                            <span className="tag tag-amber">{stock.sector}</span>
                            <a href={`https://efts.sec.gov/LATEST/search-index?q=%22${stock.ticker}%22&dateRange=custom&startdt=2024-01-01&forms=10-K,10-Q,8-K`}
                                target="_blank" rel="noopener noreferrer"
                                className="tag"
                                style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)', textDecoration: 'none', opacity: 0.8 }}>
                                📄 SEC EDGAR ↗
                            </a>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{stock.name}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 32, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                            ${fmt(stock.price)}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: stock.change >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>
                            {stock.change >= 0 ? '+' : ''}${Math.abs(stock.change).toFixed(2)} today
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, auto)', gap: '6px 24px', marginLeft: 'auto' }}>
                        <QuickStat label="MKT CAP" value={stock.marketCap > 0 ? fmtBig(stock.marketCap) : '—'} />
                        <QuickStat label="P/E RATIO" value={stock.pe ? stock.pe.toFixed(1) : '—'} />
                        <QuickStat label="EPS (TTM)" value={stock.eps ? `$${stock.eps.toFixed(2)}` : '—'} />
                        <QuickStat label="DIVIDEND" value={stock.dividend > 0 ? `$${stock.dividend.toFixed(2)}` : '—'} />
                        <QuickStat label="52W HIGH" value={stock.week52High ? `$${fmt(stock.week52High)}` : '—'} />
                        <QuickStat label="52W LOW" value={stock.week52Low ? `$${fmt(stock.week52Low)}` : '—'} />
                    </div>
                </div>

                {/* 52-week range bar */}
                {stock.week52High > stock.week52Low && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 80 }}>${fmt(stock.week52Low)}</span>
                        <div style={{ flex: 1, height: 4, background: 'var(--bg-active)', borderRadius: 2, position: 'relative' }}>
                            <div style={{
                                position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 2,
                                width: `${Math.max(0, Math.min(100, ((stock.price - stock.week52Low) / (stock.week52High - stock.week52Low)) * 100))}%`,
                                background: 'linear-gradient(90deg, var(--red), var(--amber), var(--green))'
                            }} />
                            <div style={{
                                position: 'absolute',
                                left: `${Math.max(0, Math.min(100, ((stock.price - stock.week52Low) / (stock.week52High - stock.week52Low)) * 100))}%`,
                                transform: 'translateX(-50%)',
                                top: -4, width: 12, height: 12, borderRadius: '50%',
                                background: 'var(--amber)', border: '2px solid var(--bg-base)',
                            }} />
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 80, textAlign: 'right' }}>${fmt(stock.week52High)}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                            {Math.max(0, Math.min(100, (((stock.price - stock.week52Low) / (stock.week52High - stock.week52Low)) * 100))).toFixed(0)}th percentile
                        </span>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="tab-bar" style={{ padding: '0 8px' }}>
                {TABS.map(t => (
                    <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
                ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                {tab === 'CHART' && <CandlestickChart ticker={ticker} height={400} />}
                {tab === 'ORDER BOOK' && <OrderBook ticker={ticker} midPrice={stock.price} />}
                {tab === 'FUNDAMENTALS' && <FundamentalsTab stock={stock} competitors={competitors} />}
                {tab === 'ECO MAP' && (
                    <CompetitorMap
                        ticker={ticker}
                        price={stock.price}
                        marketCap={stock.marketCap}
                        pe={stock.pe ?? 20}
                        revenueGrowth={0}
                        onSelectTicker={t => { window.location.hash = t; }}
                    />
                )}
                {tab === 'EDGAR' && <EdgarTab ticker={ticker} name={stock.name} />}
            </div>
        </div>
    );
}

function QuickStat({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        </div>
    );
}

function FundamentalsTab({ stock, competitors }: { stock: any; competitors: any[] }) {
    const all = [stock, ...competitors.slice(0, 5)];
    const metrics = [
        { label: 'Price', key: (s: any) => `$${fmt(s.price)}` },
        { label: 'Market Cap', key: (s: any) => s.marketCap > 0 ? fmtBig(s.marketCap) : '—' },
        { label: 'P/E Ratio', key: (s: any) => s.pe ? s.pe.toFixed(1) : '—' },
        { label: 'EV/EBITDA', key: () => '—' },
        { label: 'Revenue', key: () => '—' },
        { label: 'Rev. Growth', key: () => '—' },
        { label: 'Net Margin', key: () => '—' },
        { label: 'Debt/Equity', key: () => '—' },
        { label: 'Analyst Target', key: () => '—' },
        { label: 'Dividend', key: (s: any) => s.dividend > 0 ? `$${s.dividend.toFixed(2)}` : '—' },
        { label: '52W Range', key: (s: any) => s.week52Low && s.week52High ? `$${fmt(s.week52Low)} – $${fmt(s.week52High)}` : '—' },
    ];

    return (
        <div style={{ overflow: 'auto', height: '100%', padding: 12 }}>
            <div style={{ paddingBottom: 12, fontSize: 11, color: 'var(--text-muted)' }}>* Deep fundamentals requires premium API integration.</div>
            <table>
                <thead>
                    <tr>
                        <th style={{ minWidth: 120 }}>METRIC</th>
                        {all.map((s, i) => (
                            <th key={i} style={{ textAlign: 'right', color: i === 0 ? 'var(--amber)' : 'var(--text-muted)', minWidth: 100 }}>
                                {s.ticker}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {metrics.map(m => (
                        <tr key={m.label}>
                            <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{m.label}</td>
                            {all.map((s, i) => (
                                <td key={i} style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                    {m.key(s)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const FILING_TYPES = [
    { code: '10-K', label: 'Annual Report', desc: 'Full-year financials, MD&A, risk factors', icon: '📋' },
    { code: '10-Q', label: 'Quarterly Report', desc: 'Quarterly financials & management discussion', icon: '📊' },
    { code: '8-K', label: 'Current Report', desc: 'Material events: earnings, M&A, leadership', icon: '🔔' },
    { code: 'DEF14A', label: 'Proxy Statement', desc: 'Exec compensation, shareholder votes', icon: '🗳' },
    { code: 'SC 13G', label: 'Institutional 13G', desc: 'Investors owning >5% of shares', icon: '🏛' },
    { code: 'Form 4', label: 'Insider Transactions', desc: 'Officer & director buy/sell activity', icon: '👔' },
];

function EdgarTab({ ticker, name }: { ticker: string; name: string }) {
    const baseUrl = `https://efts.sec.gov/LATEST/search-index?q=%22${ticker}%22&dateRange=custom&startdt=2024-01-01`;
    const companyUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(name.split(' ')[0])}&type=10-K&dateb=&owner=include&count=10`;

    return (
        <div style={{ height: '100%', overflow: 'auto', padding: 16 }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(0,188,212,0.08), rgba(0,188,212,0.03))',
                border: '1px solid rgba(0,188,212,0.25)', borderRadius: 4, padding: '12px 16px', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 12,
            }}>
                <span style={{ fontSize: 24 }}>📄</span>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.08em' }}>SEC EDGAR — {ticker}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        Public filings database · Electronic Data Gathering, Analysis, and Retrieval
                    </div>
                </div>
                <a href={companyUrl} target="_blank" rel="noopener noreferrer"
                    className="btn btn-amber" style={{ marginLeft: 'auto', textDecoration: 'none', fontSize: 10 }}>
                    OPEN ON SEC.GOV ↗
                </a>
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 10 }}>FILING TYPES</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8, marginBottom: 20 }}>
                {FILING_TYPES.map(f => (
                    <a key={f.code} href={`${baseUrl}&forms=${encodeURIComponent(f.code)}`} target="_blank" rel="noopener noreferrer"
                        style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                            background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4,
                            textDecoration: 'none', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.background = 'var(--bg-panel-alt)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-panel)'; }}
                    >
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan)', marginBottom: 2 }}>
                                {f.code} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>— {f.label}</span>
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', color: 'var(--cyan)', fontSize: 12, flexShrink: 0 }}>↗</span>
                    </a>
                ))}
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--bg-panel-alt)', borderRadius: 4, border: '1px solid var(--border)', fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                ℹ️ Links open SEC EDGAR filtered to <strong style={{ color: 'var(--amber)' }}>{ticker}</strong>.
                All data is sourced from U.S. Securities and Exchange Commission public records. Not financial advice.
            </div>
        </div>
    );
}
