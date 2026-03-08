// ============================================================
// MARKET DATA LIBRARY — Mock data + live API helpers
// ============================================================

export interface Quote {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changePct: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    marketCap: number;
    pe: number | null;
    eps: number | null;
    dividend: number;
    week52High: number;
    week52Low: number;
    sector: string;
    analystTarget: number | null;
    revenue: number | null;
    netMargin: number | null;
    debtEquity: number | null;
    revenueGrowth: number | null;
    evEbitda: number | null;
}

export interface Candle {
    time: number; // unix seconds
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface OrderLevel {
    price: number;
    size: number;
    total: number;
}

// Seeded PRNG for consistent mock data
function mulberry32(seed: number) {
    return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function randomWalk(start: number, steps: number, volatility: number, seed: number): number[] {
    const rng = mulberry32(seed);
    const result: number[] = [start];
    for (let i = 1; i < steps; i++) {
        const change = (rng() - 0.5) * 2 * volatility * result[i - 1];
        result.push(Math.max(result[i - 1] + change, 0.01));
    }
    return result;
}

// Generates realistic OHLCV candles
export function generateCandles(basePrice: number, count: number, volatility = 0.015, seed = 42): Candle[] {
    const prices = randomWalk(basePrice, count + 1, volatility, seed);
    const now = Math.floor(Date.now() / 1000);
    return Array.from({ length: count }, (_, i) => {
        const rng = mulberry32(seed + i);
        const o = prices[i];
        const c = prices[i + 1];
        const hi = Math.max(o, c) * (1 + rng() * volatility);
        const lo = Math.min(o, c) * (1 - rng() * volatility);
        const vol = Math.floor(1_000_000 + rng() * 50_000_000);
        return {
            time: now - (count - i) * 86400,
            open: +o.toFixed(2),
            high: +hi.toFixed(2),
            low: +lo.toFixed(2),
            close: +c.toFixed(2),
            volume: vol,
        };
    });
}

// Master stock database
export const STOCKS: Record<string, Quote> = {
    AAPL: { ticker: 'AAPL', name: 'Apple Inc.', price: 189.30, change: 2.14, changePct: 1.14, open: 187.10, high: 190.20, low: 186.80, close: 189.30, volume: 62_500_000, marketCap: 2_940_000_000_000, pe: 31.2, eps: 6.07, dividend: 0.97, week52High: 199.62, week52Low: 164.08, sector: 'Technology', analystTarget: 205, revenue: 391_035_000_000, netMargin: 0.254, debtEquity: 1.73, revenueGrowth: 0.078, evEbitda: 24.1 },
    MSFT: { ticker: 'MSFT', name: 'Microsoft Corp.', price: 415.52, change: 3.87, changePct: 0.94, open: 411.60, high: 417.80, low: 410.30, close: 415.52, volume: 22_100_000, marketCap: 3_090_000_000_000, pe: 36.8, eps: 11.29, dividend: 3.0, week52High: 430.82, week52Low: 309.45, sector: 'Technology', analystTarget: 450, revenue: 227_583_000_000, netMargin: 0.361, debtEquity: 0.44, revenueGrowth: 0.158, evEbitda: 29.3 },
    GOOGL: { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 165.22, change: -1.34, changePct: -0.81, open: 166.55, high: 167.10, low: 164.90, close: 165.22, volume: 28_400_000, marketCap: 2_060_000_000_000, pe: 24.6, eps: 6.72, dividend: 0, week52High: 191.75, week52Low: 130.67, sector: 'Technology', analystTarget: 185, revenue: 307_394_000_000, netMargin: 0.238, debtEquity: 0.08, revenueGrowth: 0.084, evEbitda: 17.8 },
    AMZN: { ticker: 'AMZN', name: 'Amazon.com Inc.', price: 195.40, change: 4.20, changePct: 2.20, open: 191.10, high: 196.60, low: 190.30, close: 195.40, volume: 41_200_000, marketCap: 2_090_000_000_000, pe: 42.1, eps: 4.64, dividend: 0, week52High: 201.20, week52Low: 151.61, sector: 'Consumer', analystTarget: 225, revenue: 590_740_000_000, netMargin: 0.055, debtEquity: 0.65, revenueGrowth: 0.127, evEbitda: 18.2 },
    META: { ticker: 'META', name: 'Meta Platforms Inc.', price: 528.60, change: 8.40, changePct: 1.62, open: 520.10, high: 530.90, low: 519.20, close: 528.60, volume: 15_800_000, marketCap: 1_360_000_000_000, pe: 27.4, eps: 19.29, dividend: 2.0, week52High: 544.41, week52Low: 352.68, sector: 'Technology', analystTarget: 600, revenue: 134_902_000_000, netMargin: 0.344, debtEquity: 0.12, revenueGrowth: 0.221, evEbitda: 19.1 },
    NVDA: { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 875.40, change: -12.30, changePct: -1.39, open: 887.60, high: 892.10, low: 872.20, close: 875.40, volume: 48_600_000, marketCap: 2_160_000_000_000, pe: 68.7, eps: 12.75, dividend: 0.16, week52High: 974.00, week52Low: 474.96, sector: 'Technology', analystTarget: 1050, revenue: 60_922_000_000, netMargin: 0.553, debtEquity: 0.41, revenueGrowth: 1.225, evEbitda: 52.3 },
    TSLA: { ticker: 'TSLA', name: 'Tesla Inc.', price: 172.28, change: -5.64, changePct: -3.17, open: 177.90, high: 178.40, low: 171.10, close: 172.28, volume: 112_500_000, marketCap: 549_000_000_000, pe: 45.2, eps: 3.81, dividend: 0, week52High: 264.86, week52Low: 138.80, sector: 'Consumer', analystTarget: 225, revenue: 97_690_000_000, netMargin: 0.053, debtEquity: 0.18, revenueGrowth: -0.007, evEbitda: 29.8 },
    JPM: { ticker: 'JPM', name: 'JPMorgan Chase & Co.', price: 235.70, change: 1.90, changePct: 0.81, open: 233.80, high: 236.50, low: 233.10, close: 235.70, volume: 9_800_000, marketCap: 679_000_000_000, pe: 12.1, eps: 19.47, dividend: 5.0, week52High: 243.45, week52Low: 183.48, sector: 'Financials', analystTarget: 260, revenue: 165_935_000_000, netMargin: 0.278, debtEquity: 1.21, revenueGrowth: 0.042, evEbitda: null },
    JNJ: { ticker: 'JNJ', name: 'Johnson & Johnson', price: 153.40, change: 0.60, changePct: 0.39, open: 152.80, high: 154.10, low: 152.50, close: 153.40, volume: 6_400_000, marketCap: 370_000_000_000, pe: 22.3, eps: 6.88, dividend: 4.96, week52High: 168.12, week52Low: 143.13, sector: 'Healthcare', analystTarget: 175, revenue: 85_159_000_000, netMargin: 0.177, debtEquity: 0.53, revenueGrowth: 0.064, evEbitda: 14.2 },
    XOM: { ticker: 'XOM', name: 'ExxonMobil Corp.', price: 108.20, change: 0.85, changePct: 0.79, open: 107.35, high: 108.90, low: 107.10, close: 108.20, volume: 14_200_000, marketCap: 461_000_000_000, pe: 14.2, eps: 7.62, dividend: 3.80, week52High: 119.55, week52Low: 94.02, sector: 'Energy', analystTarget: 125, revenue: 398_675_000_000, netMargin: 0.068, debtEquity: 0.20, revenueGrowth: -0.052, evEbitda: 7.8 },
    WMT: { ticker: 'WMT', name: 'Walmart Inc.', price: 87.50, change: 1.10, changePct: 1.27, open: 86.40, high: 87.90, low: 86.20, close: 87.50, volume: 8_100_000, marketCap: 703_000_000_000, pe: 31.4, eps: 2.78, dividend: 0.83, week52High: 94.37, week52Low: 63.97, sector: 'Consumer', analystTarget: 95, revenue: 665_002_000_000, netMargin: 0.024, debtEquity: 0.68, revenueGrowth: 0.053, evEbitda: 17.9 },
    BAC: { ticker: 'BAC', name: 'Bank of America Corp.', price: 44.20, change: 0.65, changePct: 1.49, open: 43.55, high: 44.40, low: 43.40, close: 44.20, volume: 42_800_000, marketCap: 348_000_000_000, pe: 13.8, eps: 3.21, dividend: 1.0, week52High: 46.49, week52Low: 32.28, sector: 'Financials', analystTarget: 52, revenue: 101_148_000_000, netMargin: 0.282, debtEquity: 1.07, revenueGrowth: 0.032, evEbitda: null },
    V: { ticker: 'V', name: 'Visa Inc.', price: 285.60, change: 2.40, changePct: 0.85, open: 283.20, high: 286.10, low: 282.90, close: 285.60, volume: 7_300_000, marketCap: 580_000_000_000, pe: 30.2, eps: 9.46, dividend: 2.36, week52High: 290.96, week52Low: 220.15, sector: 'Financials', analystTarget: 320, revenue: 35_926_000_000, netMargin: 0.543, debtEquity: 0.56, revenueGrowth: 0.098, evEbitda: 22.4 },
    PG: { ticker: 'PG', name: "Procter & Gamble Co.", price: 163.80, change: 0.40, changePct: 0.24, open: 163.40, high: 164.30, low: 163.10, close: 163.80, volume: 5_600_000, marketCap: 385_000_000_000, pe: 27.1, eps: 6.04, dividend: 3.97, week52High: 170.06, week52Low: 153.50, sector: 'Consumer', analystTarget: 180, revenue: 84_039_000_000, netMargin: 0.181, debtEquity: 0.73, revenueGrowth: 0.029, evEbitda: 20.3 },
    UNH: { ticker: 'UNH', name: 'UnitedHealth Group', price: 487.60, change: -3.20, changePct: -0.65, open: 490.80, high: 491.50, low: 486.10, close: 487.60, volume: 2_900_000, marketCap: 454_000_000_000, pe: 21.4, eps: 22.79, dividend: 8.0, week52High: 552.27, week52Low: 441.54, sector: 'Healthcare', analystTarget: 575, revenue: 371_622_000_000, netMargin: 0.061, debtEquity: 0.73, revenueGrowth: 0.082, evEbitda: 14.8 },
    MA: { ticker: 'MA', name: 'Mastercard Inc.', price: 481.20, change: 4.10, changePct: 0.86, open: 477.10, high: 482.50, low: 476.40, close: 481.20, volume: 3_200_000, marketCap: 441_000_000_000, pe: 36.4, eps: 13.22, dividend: 2.64, week52High: 518.47, week52Low: 379.21, sector: 'Financials', analystTarget: 550, revenue: 25_098_000_000, netMargin: 0.462, debtEquity: 2.12, revenueGrowth: 0.120, evEbitda: 28.6 },
    HD: { ticker: 'HD', name: 'Home Depot Inc.', price: 367.40, change: 2.60, changePct: 0.71, open: 364.80, high: 368.50, low: 364.20, close: 367.40, volume: 3_800_000, marketCap: 365_000_000_000, pe: 22.8, eps: 16.10, dividend: 9.0, week52High: 395.97, week52Low: 318.36, sector: 'Consumer', analystTarget: 420, revenue: 152_669_000_000, netMargin: 0.095, debtEquity: null, revenueGrowth: 0.028, evEbitda: 14.8 },
    CVX: { ticker: 'CVX', name: 'Chevron Corp.', price: 152.30, change: -0.90, changePct: -0.59, open: 153.20, high: 153.60, low: 151.90, close: 152.30, volume: 8_700_000, marketCap: 285_000_000_000, pe: 14.8, eps: 10.29, dividend: 6.52, week52High: 168.96, week52Low: 139.62, sector: 'Energy', analystTarget: 175, revenue: 200_949_000_000, netMargin: 0.083, debtEquity: 0.16, revenueGrowth: -0.084, evEbitda: 8.1 },
    ABBV: { ticker: 'ABBV', name: 'AbbVie Inc.', price: 184.60, change: 1.20, changePct: 0.65, open: 183.40, high: 185.10, low: 183.10, close: 184.60, volume: 6_200_000, marketCap: 326_000_000_000, pe: 54.8, eps: 3.37, dividend: 6.2, week52High: 196.49, week52Low: 141.26, sector: 'Healthcare', analystTarget: 210, revenue: 54_318_000_000, netMargin: 0.132, debtEquity: null, revenueGrowth: 0.040, evEbitda: 18.4 },
    CRM: { ticker: 'CRM', name: 'Salesforce Inc.', price: 296.80, change: 3.50, changePct: 1.19, open: 293.30, high: 297.50, low: 292.80, close: 296.80, volume: 5_100_000, marketCap: 285_000_000_000, pe: 44.2, eps: 6.71, dividend: 0, week52High: 348.86, week52Low: 212.00, sector: 'Technology', analystTarget: 340, revenue: 34_857_000_000, netMargin: 0.149, debtEquity: 0.22, revenueGrowth: 0.110, evEbitda: 25.1 },
    AMD: { ticker: 'AMD', name: 'Advanced Micro Devices', price: 164.50, change: 2.30, changePct: 1.42, open: 162.20, high: 165.30, low: 161.90, close: 164.50, volume: 56_800_000, marketCap: 266_000_000_000, pe: 52.3, eps: 3.15, dividend: 0, week52High: 227.30, week52Low: 122.72, sector: 'Technology', analystTarget: 210, revenue: 22_680_000_000, netMargin: 0.054, debtEquity: 0.05, revenueGrowth: 0.140, evEbitda: 32.4 },
    INTC: { ticker: 'INTC', name: 'Intel Corp.', price: 21.60, change: -0.40, changePct: -1.82, open: 22.00, high: 22.10, low: 21.40, close: 21.60, volume: 62_100_000, marketCap: 91_000_000_000, pe: null, eps: -0.16, dividend: 0.5, week52High: 35.85, week52Low: 18.51, sector: 'Technology', analystTarget: 26, revenue: 54_228_000_000, netMargin: -0.003, debtEquity: 0.59, revenueGrowth: -0.020, evEbitda: null },
    GS: { ticker: 'GS', name: 'Goldman Sachs Group', price: 561.40, change: 5.80, changePct: 1.04, open: 555.60, high: 562.90, low: 554.70, close: 561.40, volume: 2_100_000, marketCap: 183_000_000_000, pe: 14.6, eps: 38.47, dividend: 11.0, week52High: 627.04, week52Low: 389.83, sector: 'Financials', analystTarget: 620, revenue: 53_511_000_000, netMargin: 0.358, debtEquity: 3.21, revenueGrowth: 0.085, evEbitda: null },
};

export const INDICES = [
    { ticker: 'SPY', name: 'S&P 500', price: 5078.65, changePct: 0.43 },
    { ticker: 'QQQ', name: 'NASDAQ 100', price: 17856.21, changePct: 0.71 },
    { ticker: 'DJI', name: 'Dow Jones', price: 38795.44, changePct: 0.22 },
    { ticker: 'VIX', name: 'Volatility', price: 14.82, changePct: -3.20 },
    { ticker: 'BTC', name: 'Bitcoin', price: 87420.00, changePct: 2.14 },
    { ticker: 'ETH', name: 'Ethereum', price: 3218.50, changePct: 1.87 },
    { ticker: 'SOL', name: 'Solana', price: 142.30, changePct: -1.23 },
    { ticker: 'GOLD', name: 'Gold Spot', price: 2381.40, changePct: 0.31 },
];

export function getStockList() {
    return Object.values(STOCKS);
}

export function getQuote(ticker: string): Quote | null {
    return STOCKS[ticker.toUpperCase()] ?? null;
}

// Generate competitors for a given ticker
export function getCompetitors(ticker: string): Quote[] {
    const q = getQuote(ticker);
    if (!q) return [];
    return Object.values(STOCKS)
        .filter(s => s.sector === q.sector && s.ticker !== ticker)
        .sort((a, b) => b.marketCap - a.marketCap)
        .slice(0, 8);
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

// HEAT MAP DATA — S&P 500 representative sample (200 stocks)
export const HEATMAP_STOCKS = (() => {
    const sectors: Record<string, { tickers: [string, string, number][] }> = {
        Technology: {
            tickers: [
                ['AAPL', 'Apple', 2940], ['MSFT', 'Microsoft', 3090], ['NVDA', 'NVIDIA', 2160], ['GOOGL', 'Alphabet', 2060], ['META', 'Meta', 1360],
                ['AMZN', 'Amazon', 2090], ['TSLA', 'Tesla', 549], ['AMD', 'AMD', 266], ['CRM', 'Salesforce', 285], ['INTC', 'Intel', 91],
                ['AVGO', 'Broadcom', 680], ['ORCL', 'Oracle', 415], ['CSCO', 'Cisco', 198], ['QCOM', 'Qualcomm', 174], ['TXN', 'Texas Inst', 165],
                ['NOW', 'ServiceNow', 215], ['ADBE', 'Adobe', 198], ['AMAT', 'Appl Materials', 178], ['MU', 'Micron', 108], ['KLAC', 'KLA Corp', 91],
            ]
        },
        Financials: {
            tickers: [
                ['JPM', 'JPMorgan', 679], ['BAC', 'Bank of America', 348], ['V', 'Visa', 580], ['MA', 'Mastercard', 441], ['GS', 'Goldman Sachs', 183],
                ['WFC', 'Wells Fargo', 218], ['MS', 'Morgan Stanley', 175], ['BLK', 'BlackRock', 145], ['SCHW', 'Schwab', 134], ['AXP', 'Amex', 180],
                ['C', 'Citigroup', 125], ['USB', 'US Bancorp', 66], ['BK', 'BNY Mellon', 53], ['TFC', 'Truist', 51], ['PNC', 'PNC Financial', 62],
            ]
        },
        Healthcare: {
            tickers: [
                ['JNJ', 'J&J', 370], ['UNH', 'UnitedHealth', 454], ['ABBV', 'AbbVie', 326], ['LLY', 'Eli Lilly', 720], ['PFE', 'Pfizer', 160],
                ['MRK', 'Merck', 280], ['TMO', 'Thermo Fisher', 198], ['DHR', 'Danaher', 175], ['ABT', 'Abbott', 195], ['BMY', 'BMS', 128],
                ['AMGN', 'Amgen', 148], ['GILD', 'Gilead', 96], ['ISRG', 'Intuitive Surgical', 175], ['SYK', 'Stryker', 120], ['BSX', 'Boston Sci', 115],
            ]
        },
        Consumer: {
            tickers: [
                ['AMZN2', 'Amazon Cons.', 2090], ['WMT', 'Walmart', 703], ['PG', 'Procter & Gamble', 385], ['HD', 'Home Depot', 365], ['TSLA2', 'Tesla Auto', 549],
                ['COST', 'Costco', 395], ['NKE', 'Nike', 98], ['MCD', 'McDonald\'s', 208], ['SBUX', 'Starbucks', 78], ['TGT', 'Target', 66],
                ['LOW', 'Lowe\'s', 152], ['DIS', 'Disney', 165], ['NFLX', 'Netflix', 310], ['BKNG', 'Booking', 128], ['ABNB', 'Airbnb', 78],
            ]
        },
        Energy: {
            tickers: [
                ['XOM', 'ExxonMobil', 461], ['CVX', 'Chevron', 285], ['COP', 'ConocoPhillips', 145], ['EOG', 'EOG Resources', 68], ['SLB', 'Schlumberger', 62],
                ['PSX', 'Phillips 66', 55], ['VLO', 'Valero', 48], ['MPC', 'Marathon Petro', 65], ['OXY', 'Occidental', 52], ['HAL', 'Halliburton', 28],
            ]
        },
        Industrials: {
            tickers: [
                ['CAT', 'Caterpillar', 165], ['HON', 'Honeywell', 135], ['GE', 'GE', 188], ['UPS', 'UPS', 110], ['BA', 'Boeing', 115],
                ['LMT', 'Lockheed', 115], ['RTX', 'Raytheon', 148], ['DE', 'Deere', 120], ['FDX', 'FedEx', 68], ['NSC', 'Norfolk Southern', 58],
            ]
        },
        Utilities: {
            tickers: [
                ['NEE', 'NextEra', 128], ['DUK', 'Duke Energy', 68], ['SO', 'Southern', 75], ['D', 'Dominion', 44], ['SRE', 'Sempra', 48],
                ['AEP', 'AEP', 45], ['EXC', 'Exelon', 38], ['XEL', 'Xcel', 31], ['WEC', 'WEC Energy', 26], ['ES', 'Eversource', 23],
            ]
        },
        'Real Estate': {
            tickers: [
                ['PLD', 'Prologis', 104], ['AMT', 'Amer Tower', 80], ['EQIX', 'Equinix', 78], ['CCI', 'Crown Castle', 42], ['SPG', 'Simon Prop', 55],
            ]
        },
        Materials: {
            tickers: [
                ['LIN', 'Linde', 190], ['APD', 'Air Products', 60], ['ECL', 'Ecolab', 55], ['NEM', 'Newmont', 42], ['FCX', 'Freeport', 58],
            ]
        },
    };

    const rng = mulberry32(1337);
    const result: { ticker: string; name: string; sector: string; marketCap: number; changePct: number }[] = [];

    for (const [sector, { tickers }] of Object.entries(sectors)) {
        for (const [ticker, name, cap] of tickers) {
            const changePct = (rng() - 0.44) * 8; // slightly bearish bias range -3.5% to +4.5%
            result.push({ ticker, name, sector, marketCap: cap * 1_000_000_000, changePct: +changePct.toFixed(2) });
        }
    }

    return result;
})();

// Order book generator
export function generateOrderBook(midPrice: number, levels = 15): { bids: OrderLevel[]; asks: OrderLevel[] } {
    const rng = mulberry32(Math.floor(midPrice));
    const spread = midPrice * 0.0001;
    const bids: OrderLevel[] = [];
    const asks: OrderLevel[] = [];
    let bidTotal = 0, askTotal = 0;

    for (let i = 0; i < levels; i++) {
        const bidPrice = midPrice - spread - i * midPrice * 0.0002 * (1 + rng() * 0.5);
        const askPrice = midPrice + spread + i * midPrice * 0.0002 * (1 + rng() * 0.5);
        const bidSize = Math.floor(100 + rng() * 2000);
        const askSize = Math.floor(100 + rng() * 2000);
        bidTotal += bidSize;
        askTotal += askSize;
        bids.push({ price: +bidPrice.toFixed(2), size: bidSize, total: bidTotal });
        asks.push({ price: +askPrice.toFixed(2), size: askSize, total: askTotal });
    }

    return { bids, asks };
}
