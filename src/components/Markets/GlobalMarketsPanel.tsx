'use client';
import { useState, useMemo, useEffect } from 'react';
import { GLOBAL_STOCKS, EXCHANGES } from '@/lib/globalStocks';
import stockUniverse from '@/lib/stockUniverse';
import CandlestickChart from '../Charts/CandlestickChart';
import ExchangeDashboard from './ExchangeDashboard';
import { getWsClient } from '@/lib/wsClient';
import { fmtBig } from '@/lib/marketData';

type SortKey = 'marketCap' | 'changePct' | 'name' | 'exchange' | 'country';

const SECTOR_COLORS: Record<string, string> = {
    Technology: 'var(--blue)', Financials: 'var(--cyan)', Healthcare: 'var(--green)',
    Energy: 'var(--amber)', Consumer: 'var(--purple)', Industrials: 'var(--text-secondary)',
    Materials: 'var(--red)', Utilities: '#9eccc1', 'Real Estate': '#c49a6c',
};

interface GlobalMeta {
    ticker: string;
    name: string;
    sector: string;
    exchange: string;
    country: string;
    countryCode: string;
    flag: string;
    currency: string;
}

interface LiveQuote {
    price: number;
    changePct: number;
    marketCap: number;
    pe: number | null;
}

const EXCHANGE_META: Record<string, { country: string; countryCode: string; flag: string }> = {
    'L': { country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧' },
    'T': { country: 'Japan', countryCode: 'JP', flag: '🇯🇵' },
    'HK': { country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰' },
    'DE': { country: 'Germany', countryCode: 'DE', flag: '🇩🇪' },
    'PA': { country: 'France', countryCode: 'FR', flag: '🇫🇷' },
    'TO': { country: 'Canada', countryCode: 'CA', flag: '🇨🇦' },
    'AX': { country: 'Australia', countryCode: 'AU', flag: '🇦🇺' },
    'NS': { country: 'India', countryCode: 'IN', flag: '🇮🇳' },
    'SW': { country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭' },
    'KS': { country: 'South Korea', countryCode: 'KR', flag: '🇰🇷' },
    'AS': { country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱' },
    'MC': { country: 'Spain', countryCode: 'ES', flag: '🇪🇸' },
    'MI': { country: 'Italy', countryCode: 'IT', flag: '🇮🇹' },
    'SA': { country: 'Brazil', countryCode: 'BR', flag: '🇧🇷' },
    'ST': { country: 'Sweden', countryCode: 'SE', flag: '🇸🇪' },
    'SI': { country: 'Singapore', countryCode: 'SG', flag: '🇸🇬' },
    'TW': { country: 'Taiwan', countryCode: 'TW', flag: '🇹🇼' },
    'SR': { country: 'Saudi Arabia', countryCode: 'SA', flag: '🇸🇦' },
};

const exchangeNameMap: Record<string, string> = {
    'L': 'LSE', 'T': 'TSE', 'HK': 'HKEX', 'DE': 'XETRA', 'PA': 'Euronext Paris',
    'TO': 'TSX', 'AX': 'ASX', 'NS': 'NSE', 'SW': 'SIX', 'KS': 'KRX',
    'AS': 'Euronext Amsterdam', 'MC': 'BME', 'MI': 'Borsa Italiana',
    'SA': 'B3', 'ST': 'Nasdaq Nordic', 'SI': 'SGX', 'TW': 'TWSE', 'SR': 'Tadawul',
};

const currencyMap: Record<string, string> = {
    'L': 'GBX', 'T': 'JPY', 'HK': 'HKD', 'DE': 'EUR', 'PA': 'EUR', 'TO': 'CAD', 'AX': 'AUD',
    'NS': 'INR', 'SW': 'CHF', 'KS': 'KRW', 'AS': 'EUR', 'MC': 'EUR', 'MI': 'EUR', 'SA': 'BRL',
    'ST': 'SEK', 'SI': 'SGD', 'TW': 'TWD', 'SR': 'SAR',
};

function buildAllMetadata(): GlobalMeta[] {
    const seen = new Set<string>();
    const meta: GlobalMeta[] = [];

    // 1. GLOBAL_STOCKS mapping
    for (const s of Object.values(GLOBAL_STOCKS)) {
        if (!seen.has(s.ticker)) {
            meta.push({
                ticker: s.ticker, name: s.name, sector: s.sector,
                exchange: s.exchange, country: s.country, countryCode: s.countryCode,
                flag: s.flag, currency: s.currency
            });
            seen.add(s.ticker);
        }
    }

    // 2. US SP500_COMPACT
    for (const [ticker, name, sector] of stockUniverse.SP500_COMPACT) {
        if (!seen.has(ticker as string)) {
            meta.push({
                ticker: ticker as string, name: name as string, sector: sector as string,
                exchange: 'US Exchanges', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD'
            });
            seen.add(ticker as string);
        }
    }

    // 3. GLOBAL_COMPACT
    for (const [ticker, name, sector] of stockUniverse.GLOBAL_COMPACT) {
        const t = ticker as string;
        if (!seen.has(t)) {
            const parts = t.split('.');
            const suffix = parts.length > 1 ? parts[parts.length - 1] : '';
            const mx = EXCHANGE_META[suffix] ?? { country: 'Global', countryCode: 'GL', flag: '🌐' };
            const ex = exchangeNameMap[suffix] ?? suffix ?? 'OTC';
            const cur = currencyMap[suffix] ?? 'USD';

            meta.push({
                ticker: t, name: name as string, sector: sector as string,
                exchange: ex, country: mx.country, countryCode: mx.countryCode,
                flag: mx.flag, currency: cur
            });
            seen.add(t);
        }
    }

    return meta;
}

const ALL_META = buildAllMetadata();

export default function GlobalMarketsPanel() {
    const [filterExchange, setFilterExchange] = useState<string>('ALL');
    const [filterSector, setFilterSector] = useState<string>('ALL');
    const [filterCountry, setFilterCountry] = useState<string>('ALL');
    const [sortKey, setSortKey] = useState<SortKey>('marketCap');
    const [sortAsc, setSortAsc] = useState(false);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<'stocks' | 'exchanges'>('stocks');
    const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
    const [selectedMeta, setSelectedMeta] = useState<GlobalMeta | null>(null);
    const [selectedExchangeDashboard, setSelectedExchangeDashboard] = useState<string | null>(null);

    const [liveData, setLiveData] = useState<Record<string, LiveQuote>>({});
    const [isFetching, setIsFetching] = useState(true);

    const exchanges = useMemo(() => ['ALL', ...new Set(ALL_META.map(s => s.exchange))].sort(), []);
    const sectors = useMemo(() => ['ALL', ...new Set(ALL_META.map(s => s.sector))].sort(), []);
    const countries = useMemo(() => ['ALL', ...new Set(ALL_META.map(s => s.country))].sort(), []);

    useEffect(() => {
        // Fetch snapshot of all ~200 tickers for marketCap, PE, and initial price
        const fetchBulkData = async () => {
            setIsFetching(true);
            const tickers = ALL_META.map(m => m.ticker);
            const chunkSize = 30; // Yahoo batches
            const newLiveData: Record<string, LiveQuote> = {};

            for (let i = 0; i < tickers.length; i += chunkSize) {
                const chunk = tickers.slice(i, i + chunkSize);
                try {
                    const res = await fetch(`/api/quote?tickers=${encodeURIComponent(chunk.join(','))}`);
                    if (!res.ok) continue;
                    const data = await res.json();
                    const quotes = Array.isArray(data) ? data : [data];
                    quotes.forEach((q: any) => {
                        if (q && q.ticker) {
                            newLiveData[q.ticker] = {
                                price: q.price,
                                changePct: q.changePct,
                                marketCap: q.marketCap,
                                pe: q.pe
                            };
                        }
                    });
                } catch (e) {
                    console.error('Failed to fetch chunk', chunk, e);
                }
            }
            setLiveData(newLiveData);
            setIsFetching(false);
        };
        fetchBulkData();

        // Optional: subscribe to live polling updates for the filtered view
        // We subscribe to the whole universe to keep the grid updating
        const client = getWsClient();
        const unsubs = ALL_META.map(m => client.subscribe(m.ticker, ev => {
            setLiveData(prev => {
                const existing = prev[m.ticker];
                if (!existing) return prev;
                if (existing.price === ev.price) return prev;
                return {
                    ...prev,
                    [m.ticker]: { ...existing, price: ev.price, changePct: ev.changePct ?? existing.changePct }
                };
            });
        }));

        return () => unsubs.forEach(u => u());
    }, []);

    const combinedList = useMemo(() => {
        return ALL_META.map(m => {
            const live = liveData[m.ticker] ?? { price: 0, changePct: 0, marketCap: 0, pe: null };
            return { ...m, ...live };
        });
    }, [liveData]);

    const filtered = useMemo(() => {
        let list = combinedList;
        if (filterExchange !== 'ALL') list = list.filter(s => s.exchange === filterExchange);
        if (filterSector !== 'ALL') list = list.filter(s => s.sector === filterSector);
        if (filterCountry !== 'ALL') list = list.filter(s => s.country === filterCountry);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(s => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
        }
        return [...list].sort((a, b) => {
            let diff = 0;
            if (sortKey === 'marketCap') diff = a.marketCap - b.marketCap;
            else if (sortKey === 'changePct') diff = a.changePct - b.changePct;
            else if (sortKey === 'name') diff = a.name.localeCompare(b.name);
            else if (sortKey === 'exchange') diff = a.exchange.localeCompare(b.exchange);
            else if (sortKey === 'country') diff = a.country.localeCompare(b.country);
            return sortAsc ? diff : -diff;
        });
    }, [combinedList, filterExchange, filterSector, filterCountry, search, sortKey, sortAsc]);

    const toggleSort = (k: SortKey) => {
        if (sortKey === k) setSortAsc(a => !a);
        else { setSortKey(k); setSortAsc(false); }
    };

    const SortTH = ({ k, label, align = 'right' }: { k: SortKey; label: string; align?: string }) => (
        <th onClick={() => toggleSort(k)} style={{ cursor: 'pointer', userSelect: 'none', textAlign: align as any }}>
            {label}{sortKey === k ? (sortAsc ? ' ▲' : ' ▼') : ''}
        </th>
    );

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {selectedExchangeDashboard ? (
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <ExchangeDashboard
                        exchangeCode={selectedExchangeDashboard}
                        allStocks={combinedList}
                        onBack={() => setSelectedExchangeDashboard(null)}
                        onSelectTicker={(t) => {
                            const stock = combinedList.find(s => s.ticker === t);
                            if (stock) {
                                setSelectedTicker(t);
                                setSelectedMeta(stock);
                            }
                        }}
                    />
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Header bar */}
                    <div style={{ padding: '8px 12px', background: 'var(--bg-panel-alt)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em' }}>🌍 GLOBAL MARKETS</span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{filtered.length.toLocaleString()} of {ALL_META.length.toLocaleString()} securities</span>
                            <div style={{ flex: 1 }} />
                            <button className={`btn ${tab === 'stocks' ? 'btn-amber' : 'btn-ghost'}`} style={{ fontSize: 10 }} onClick={() => setTab('stocks')}>📋 STOCKS</button>
                            <button className={`btn ${tab === 'exchanges' ? 'btn-amber' : 'btn-ghost'}`} style={{ fontSize: 10 }} onClick={() => setTab('exchanges')}>🏛 EXCHANGES</button>
                        </div>

                        {tab === 'stocks' && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <input value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search ticker or name…"
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 3, padding: '4px 10px', color: 'var(--text-primary)', fontSize: 11, width: 180, outline: 'none' }}
                                />
                                <select value={filterExchange} onChange={e => setFilterExchange(e.target.value)}
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 3, padding: '4px 7px', color: 'var(--text-secondary)', fontSize: 10 }}>
                                    {exchanges.map(ex => <option key={ex} value={ex}>{ex === 'ALL' ? 'All Exchanges' : ex}</option>)}
                                </select>
                                <select value={filterSector} onChange={e => setFilterSector(e.target.value)}
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 3, padding: '4px 7px', color: 'var(--text-secondary)', fontSize: 10 }}>
                                    {sectors.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Sectors' : s}</option>)}
                                </select>
                                <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 3, padding: '4px 7px', color: 'var(--text-secondary)', fontSize: 10 }}>
                                    {countries.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Countries' : c}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                        {isFetching && tab === 'stocks' && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--border)' }}>
                                <div style={{ height: '100%', background: 'var(--amber)', width: '30%', animation: 'marquee 1.5s linear infinite' }} />
                            </div>
                        )}
                        {tab === 'exchanges' ? (
                            <div style={{ padding: 12 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                                    {EXCHANGES.map(ex => (
                                        <div key={ex.code}
                                            onClick={() => setSelectedExchangeDashboard(ex.code)}
                                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
                                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                            style={{ cursor: 'pointer', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, padding: '12px 14px', transition: 'border-color 0.15s' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                <span style={{ fontSize: 22 }}>{ex.flag}</span>
                                                <div>
                                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)' }}>{ex.code}</div>
                                                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{ex.name}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                                                {[['COUNTRY', ex.country], ['TIMEZONE', ex.timezone], ['HOURS', ex.hours]].map(([l, v]) => (
                                                    <div key={l}>
                                                        <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>{l}</div>
                                                        <div style={{ fontSize: 10, fontWeight: 600 }}>{v}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ marginTop: 6, fontSize: 9, color: 'var(--text-dim)' }}>~{ex.stocks.toLocaleString()} listed · click to view dashboard</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>🚩</th>
                                        <SortTH k="name" label="TICKER / NAME" align="left" />
                                        <SortTH k="exchange" label="EXCHANGE" />
                                        <SortTH k="country" label="COUNTRY" />
                                        <th style={{ textAlign: 'right' }}>PRICE</th>
                                        <SortTH k="changePct" label="CHG%" />
                                        <SortTH k="marketCap" label="MKT CAP" />
                                        <th style={{ textAlign: 'right' }}>SECTOR</th>
                                        <th style={{ textAlign: 'right' }}>P/E</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(s => (
                                        <tr key={s.ticker}
                                            onClick={() => { setSelectedTicker(s.ticker); setSelectedMeta(s); }}
                                            style={{ cursor: 'pointer', background: selectedTicker === s.ticker ? 'var(--amber-muted)' : undefined }}>
                                            <td style={{ fontSize: 14 }}>{s.flag}</td>
                                            <td>
                                                <div style={{ fontWeight: 700, fontSize: 11, color: selectedTicker === s.ticker ? 'var(--amber)' : 'var(--text-primary)' }}>{s.ticker}</div>
                                                <div style={{ fontSize: 9, color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                                            </td>
                                            <td style={{ textAlign: 'right', fontSize: 10, color: 'var(--text-secondary)' }}>{s.exchange}</td>
                                            <td style={{ textAlign: 'right', fontSize: 9, color: 'var(--text-dim)' }}>{s.country}</td>
                                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 11 }}>
                                                {s.price > 0 ? `${s.price.toLocaleString(undefined, { maximumFractionDigits: 2 })} ` : '... '}
                                                <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>{s.currency}</span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 11, color: s.changePct > 0 ? 'var(--green)' : s.changePct < 0 ? 'var(--red)' : 'var(--text-muted)' }}>
                                                {s.changePct > 0 ? '+' : ''}{s.changePct.toFixed(2)}%
                                            </td>
                                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 10 }}>{s.marketCap ? fmtBig(s.marketCap) : '—'}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: 9, color: SECTOR_COLORS[s.sector] ?? 'var(--text-muted)', fontWeight: 600 }}>{s.sector}</span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontSize: 10, color: 'var(--text-secondary)' }}>{s.pe ? `${s.pe.toFixed(1)}x` : '—'}</td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && !isFetching && (
                                        <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No securities match criteria</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* ── Right: chart panel ── */}
            {selectedTicker && selectedMeta && (
                <div style={{ width: 480, flexShrink: 0, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Stock mini header */}
                    <div style={{ padding: '8px 12px', background: 'var(--bg-panel-alt)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 20 }}>{selectedMeta.flag}</span>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)' }}>{selectedMeta.name}</div>
                                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{selectedMeta.exchange} · {selectedMeta.country} · {selectedMeta.sector}</div>
                            </div>
                            <div style={{ flex: 1 }} />
                            <button onClick={() => setSelectedTicker(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '2px 6px' }}>✕</button>
                        </div>
                    </div>
                    {/* Live chart */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <CandlestickChart ticker={selectedTicker} currency={selectedMeta.currency} />
                    </div>
                </div>
            )}
        </div>
    );
}
