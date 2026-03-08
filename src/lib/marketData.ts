import stockUniverse from './stockUniverse';
import { GLOBAL_STOCKS } from './globalStocks';

export interface Quote {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changePct: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
    marketCap?: number;
    pe?: number | null;
    currency?: string;
    exchange?: string;
    country?: string;
    sector?: string;
    source?: string;
}

export interface Candle {
    time: number; // unix seconds
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

// Format number helpers
export function fmt(n: number, decimals = 2): string {
    return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtBig(n: number): string {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
}

export function fmtPct(n: number): string {
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(2)}%`;
}

export function fmtVol(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
    return n.toString();
}

// Search indexing System
export interface SearchResult {
    ticker: string;
    name: string;
    type: 'Stock' | 'Crypto' | 'Index' | 'Bullion' | 'Forex';
}

const SEARCH_INDEX: SearchResult[] = [];

function buildSearchIndex() {
    for (const [ticker, name] of stockUniverse.SP500_COMPACT) SEARCH_INDEX.push({ ticker, name, type: 'Stock' });
    for (const [ticker, name] of stockUniverse.GLOBAL_COMPACT) SEARCH_INDEX.push({ ticker, name, type: 'Stock' });
    for (const s of Object.values(GLOBAL_STOCKS)) SEARCH_INDEX.push({ ticker: s.ticker, name: s.name, type: 'Stock' });

    const indices = [['SPY', 'S&P 500'], ['QQQ', 'NASDAQ 100'], ['DJI', 'Dow Jones'], ['VIX', 'Volatility']];
    for (const [ticker, name] of indices) SEARCH_INDEX.push({ ticker, name, type: 'Index' });

    const bullion = [['GOLD', 'Gold Spot'], ['SILV', 'Silver Spot'], ['PLAT', 'Platinum'], ['PALL', 'Palladium']];
    for (const [ticker, name] of bullion) SEARCH_INDEX.push({ ticker, name, type: 'Bullion' });

    const cryptoList = ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP', 'ADA', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE', 'DOT', 'SHIB', 'LTC', 'NEAR', 'ATOM', 'TON', 'ICP', 'APT', 'ARB'];
    for (const c of cryptoList) SEARCH_INDEX.push({ ticker: c, name: `${c} Crypto`, type: 'Crypto' });

    // Deduplicate array by ticker
    const seen = new Set<string>();
    const unique: SearchResult[] = [];
    for (const item of SEARCH_INDEX) {
        if (!seen.has(item.ticker)) {
            seen.add(item.ticker);
            unique.push(item);
        }
    }

    SEARCH_INDEX.length = 0;
    SEARCH_INDEX.push(...unique);
}

buildSearchIndex();

export function searchTickers(query: string, limit = 8): SearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return SEARCH_INDEX.map(item => {
        const t = item.ticker.toLowerCase();
        const n = item.name.toLowerCase();
        let score = 0;

        if (t === q) score = 100;
        else if (t.startsWith(q)) score = 50;
        else if (n.startsWith(q)) score = 25;
        else if (t.includes(q)) score = 10;
        else if (n.includes(q)) score = 5;

        return { item, score };
    })
        .filter(res => res.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(res => res.item);
}
