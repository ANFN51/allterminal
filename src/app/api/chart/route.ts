import { NextRequest, NextResponse } from 'next/server';

/**
 * Yahoo Finance chart proxy — free, no API key required
 * Supports any global ticker: AAPL, SHEL.L, 7203.T, 0700.HK, SAP.DE, etc.
 * Returns OHLCV candles in Lightweight Charts format
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ticker = (searchParams.get('ticker') ?? 'AAPL').toUpperCase();
    const range = searchParams.get('range') ?? '1y';
    const interval = searchParams.get('interval') ?? '1d';

    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}` +
            `?interval=${interval}&range=${range}&includePrePost=false`;

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Allterminals/2.0)',
                'Accept': 'application/json',
            },
            next: { revalidate: interval === '1d' ? 3600 : 300 },
        });

        if (!res.ok) throw new Error(`Yahoo returned ${res.status}`);
        const data = await res.json();

        const result = data?.chart?.result?.[0];
        if (!result) throw new Error('No chart result');

        const timestamps: number[] = result.timestamp ?? [];
        const quotes = result.indicators?.quote?.[0] ?? {};
        const opens: number[] = quotes.open ?? [];
        const highs: number[] = quotes.high ?? [];
        const lows: number[] = quotes.low ?? [];
        const closes: number[] = quotes.close ?? [];
        const volumes: number[] = quotes.volume ?? [];

        const meta = result.meta ?? {};
        const candles = timestamps.map((t, i) => ({
            time: t,
            open: opens[i] ? +opens[i].toFixed(4) : closes[i - 1] ?? closes[i],
            high: highs[i] ? +highs[i].toFixed(4) : closes[i],
            low: lows[i] ? +lows[i].toFixed(4) : closes[i],
            close: closes[i] ? +closes[i].toFixed(4) : 0,
            volume: volumes[i] ?? 0,
        })).filter(c => c.close > 0 && c.time > 0);

        return NextResponse.json({
            ticker,
            currency: meta.currency ?? 'USD',
            exchange: meta.exchangeName ?? '',
            longName: meta.longName ?? ticker,
            candles,
            source: 'yahoo_finance',
        });

    } catch (err) {
        // Return seeded mock data so the chart always renders
        return NextResponse.json(generateMockChart(ticker, range), { status: 200 });
    }
}

function generateMockChart(ticker: string, range: string) {
    // Seeded deterministic mock so chart looks the same on reload
    let seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    function rng() {
        seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5;
        return (seed >>> 0) / 0xffffffff;
    }

    const days = range === '5d' ? 5 : range === '1mo' ? 30 : range === '3mo' ? 90 : range === '6mo' ? 180 : range === '2y' ? 730 : range === '5y' ? 1825 : 365;
    const basePrice = 50 + rng() * 450;
    const now = Math.floor(Date.now() / 1000);
    let price = basePrice;
    const candles = [];

    for (let i = days; i >= 0; i--) {
        const vol = 0.015 + rng() * 0.02;
        const o = price;
        const change = (rng() - 0.48) * vol * price;
        const c = Math.max(o + change, 0.01);
        const hi = Math.max(o, c) * (1 + rng() * vol * 0.5);
        const lo = Math.min(o, c) * (1 - rng() * vol * 0.5);
        candles.push({
            time: now - i * 86400,
            open: +o.toFixed(2), high: +hi.toFixed(2),
            low: +lo.toFixed(2), close: +c.toFixed(2),
            volume: Math.floor(500_000 + rng() * 20_000_000),
        });
        price = c;
    }
    return { ticker, currency: 'USD', exchange: 'MOCK', longName: ticker, candles, source: 'mock' };
}
