'use client';
import { useState, useMemo } from 'react';
import { GLOBAL_STOCKS, EXCHANGES, GlobalQuote } from '@/lib/globalStocks';
import { STOCKS } from '@/lib/marketData';
import { SP500_COMPACT, GLOBAL_COMPACT } from '@/lib/stockUniverse';
import CandlestickChart from '../Charts/CandlestickChart';

type SortKey = 'marketCap' | 'changePct' | 'name' | 'exchange' | 'country';

// Sector → colour map
const SECTOR_COLORS: Record<string, string> = {
    Technology: 'var(--blue)', Financials: 'var(--cyan)', Healthcare: 'var(--green)',
    Energy: 'var(--amber)', Consumer: 'var(--purple)', Industrials: 'var(--text-secondary)',
    Materials: 'var(--red)', Utilities: '#9eccc1', 'Real Estate': '#c49a6c',
};

// PRNG for seeding deterministic change/prices
function rng(seed: number) {
    seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5;
    return (seed >>> 0) / 0xffffffff;
}

function fmtBig(n: number): string {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return `$${n.toLocaleString()}`;
}

// ---------- Build the unified securities list ----------
function buildAllStocks(): GlobalQuote[] {
    const seen = new Set<string>();

    // 1. Detailed US stocks already in STOCKS{}
    const us: GlobalQuote[] = Object.values(STOCKS).map(s => ({
        ticker: s.ticker, name: s.name, price: s.price, changePct: s.changePct,
        change: s.change, marketCap: s.marketCap, currency: 'USD',
        exchange: s.marketCap > 500e9 ? 'NYSE' : 'NASDAQ',
        country: 'United States', countryCode: 'US', flag: '🇺🇸',
        sector: s.sector, pe: s.pe, dividend: s.dividend,
        week52High: s.week52High, week52Low: s.week52Low,
    }));
    us.forEach(s => seen.add(s.ticker));

    // 2. Extended S&P 500 + Russell from compact table
    const usExtended: GlobalQuote[] = SP500_COMPACT
        .filter(([ticker]) => !seen.has(ticker))
        .map(([ticker, name, sector, price, capB, pe]) => {
            const seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const changePct = +((rng(seed) - 0.47) * 6).toFixed(2);
            const change = +(price * changePct / 100).toFixed(2);
            seen.add(ticker);
            return {
                ticker, name, price, changePct, change,
                marketCap: capB * 1e9,
                currency: 'USD',
                exchange: capB > 200 ? 'NYSE' : 'NASDAQ',
                country: 'United States', countryCode: 'US', flag: '🇺🇸',
                sector, pe: pe || null, dividend: rng(seed + 1) * 4,
                week52High: price * (1 + rng(seed + 2) * 0.35),
                week52Low: price * (1 - rng(seed + 3) * 0.35),
            };
        });

    // 3. Detailed global stocks from globalStocks.ts
    const global: GlobalQuote[] = Object.values(GLOBAL_STOCKS).filter(s => !seen.has(s.ticker));
    global.forEach(s => seen.add(s.ticker));

    // 4. Extended global compact table
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

    const globalExtended: GlobalQuote[] = GLOBAL_COMPACT
        .filter(([ticker]) => !seen.has(ticker))
        .map(([ticker, name, sector, price, capB]) => {
            const seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const changePct = +((rng(seed) - 0.47) * 5).toFixed(2);
            const change = +(price * changePct / 100).toFixed(2);
            seen.add(ticker);

            // Determine suffix: e.g. "SHEL.L" → "L", "7203.T" → "T"
            const parts = ticker.split('.');
            const suffix = parts.length > 1 ? parts[parts.length - 1] : '';
            const meta = EXCHANGE_META[suffix] ?? { country: 'Global', countryCode: 'GL', flag: '🌐' };
            const exchange = exchangeNameMap[suffix] ?? suffix ?? 'OTC';

            // Infer currency from exchange
            const currencyMap: Record<string, string> = {
                'L': 'GBX', 'T': 'JPY', 'HK': 'HKD', 'DE': 'EUR', 'PA': 'EUR', 'TO': 'CAD', 'AX': 'AUD',
                'NS': 'INR', 'SW': 'CHF', 'KS': 'KRW', 'AS': 'EUR', 'MC': 'EUR', 'MI': 'EUR', 'SA': 'BRL',
                'ST': 'SEK', 'SI': 'SGD', 'TW': 'TWD', 'SR': 'SAR',
            };
            const currency = currencyMap[suffix] ?? 'USD';

            return {
                ticker, name, price, changePct, change,
                marketCap: (capB as number) * 1e9,
                currency, exchange,
                country: meta.country, countryCode: meta.countryCode, flag: meta.flag,
                sector, pe: null, dividend: rng(seed + 1) * 4,
                week52High: price * (1 + rng(seed + 2) * 0.4),
                week52Low: price * (1 - rng(seed + 3) * 0.35),
            };
        });

    return [...us, ...usExtended, ...global, ...globalExtended];
}

const ALL_STOCKS = buildAllStocks();

export default function GlobalMarketsPanel() {
    const [filterExchange, setFilterExchange] = useState<string>('ALL');
    const [filterSector, setFilterSector] = useState<string>('ALL');
    const [filterCountry, setFilterCountry] = useState<string>('ALL');
    const [sortKey, setSortKey] = useState<SortKey>('marketCap');
    const [sortAsc, setSortAsc] = useState(false);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<'stocks' | 'exchanges'>('stocks');
    const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
    const [selectedStock, setSelectedStock] = useState<GlobalQuote | null>(null);

    const exchanges = useMemo(() => ['ALL', ...new Set(ALL_STOCKS.map(s => s.exchange))].sort(), []);
    const sectors = useMemo(() => ['ALL', ...new Set(ALL_STOCKS.map(s => s.sector))].sort(), []);
    const countries = useMemo(() => ['ALL', ...new Set(ALL_STOCKS.map(s => s.country))].sort(), []);

    const filtered = useMemo(() => {
        let list = ALL_STOCKS;
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
    }, [filterExchange, filterSector, filterCountry, search, sortKey, sortAsc]);

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
            {/* ── Left: stock list ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header bar */}
                <div style={{ padding: '8px 12px', background: 'var(--bg-panel-alt)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em' }}>🌍 GLOBAL MARKETS</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{filtered.length.toLocaleString()} of {ALL_STOCKS.length.toLocaleString()} securities</span>
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
                <div style={{ flex: 1, overflow: 'auto' }}>
                    {tab === 'exchanges' ? (
                        <div style={{ padding: 12 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                                {EXCHANGES.map(ex => (
                                    <div key={ex.code}
                                        onClick={() => { setFilterExchange(ex.code); setTab('stocks'); }}
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
                                        <div style={{ marginTop: 6, fontSize: 9, color: 'var(--text-dim)' }}>~{ex.stocks.toLocaleString()} listed · click to filter</div>
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
                                        onClick={() => { setSelectedTicker(s.ticker); setSelectedStock(s); }}
                                        style={{ cursor: 'pointer', background: selectedTicker === s.ticker ? 'var(--amber-muted)' : undefined }}>
                                        <td style={{ fontSize: 14 }}>{s.flag}</td>
                                        <td>
                                            <div style={{ fontWeight: 700, fontSize: 11, color: selectedTicker === s.ticker ? 'var(--amber)' : 'var(--amber)' }}>{s.ticker}</div>
                                            <div style={{ fontSize: 9, color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                                        </td>
                                        <td style={{ textAlign: 'right', fontSize: 10, color: 'var(--text-secondary)' }}>{s.exchange}</td>
                                        <td style={{ textAlign: 'right', fontSize: 9, color: 'var(--text-dim)' }}>{s.country}</td>
                                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 11 }}>
                                            {s.price.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>{s.currency}</span>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 11, color: s.changePct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                            {s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%
                                        </td>
                                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 10 }}>{fmtBig(s.marketCap)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: 9, color: SECTOR_COLORS[s.sector] ?? 'var(--text-muted)', fontWeight: 600 }}>{s.sector}</span>
                                        </td>
                                        <td style={{ textAlign: 'right', fontSize: 10, color: 'var(--text-secondary)' }}>{s.pe ? `${s.pe.toFixed(1)}x` : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── Right: chart panel ── */}
            {selectedTicker && selectedStock && (
                <div style={{ width: 480, flexShrink: 0, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Stock mini header */}
                    <div style={{ padding: '8px 12px', background: 'var(--bg-panel-alt)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 20 }}>{selectedStock.flag}</span>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)' }}>{selectedStock.name}</div>
                                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{selectedStock.exchange} · {selectedStock.country} · {selectedStock.sector}</div>
                            </div>
                            <div style={{ flex: 1 }} />
                            <button onClick={() => setSelectedTicker(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '2px 6px' }}>✕</button>
                        </div>
                        {/* Quick stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, marginTop: 8 }}>
                            {[
                                ['52W HIGH', selectedStock.week52High?.toFixed(2)],
                                ['52W LOW', selectedStock.week52Low?.toFixed(2)],
                                ['DIV YIELD', selectedStock.dividend ? `${selectedStock.dividend.toFixed(1)}%` : '—'],
                            ].map(([l, v]) => (
                                <div key={l} style={{ background: 'var(--bg-surface)', borderRadius: 3, padding: '4px 6px' }}>
                                    <div style={{ fontSize: 8, color: 'var(--text-dim)' }}>{l}</div>
                                    <div style={{ fontSize: 11, fontWeight: 600 }}>{v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Live chart */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <CandlestickChart ticker={selectedTicker} currency={selectedStock.currency} />
                    </div>
                </div>
            )}
        </div>
    );
}
