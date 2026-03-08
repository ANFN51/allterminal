import { NextRequest, NextResponse } from 'next/server';

/**
 * Yahoo Finance proxy — no API key required
 * Uses the undocumented v8 quote endpoint (free, real-time delayed ~15min)
 */
export async function GET(req: NextRequest) {
    const ticker = req.nextUrl.searchParams.get('ticker')?.toUpperCase();
    if (!ticker) return NextResponse.json({ error: 'Missing ticker' }, { status: 400 });

    // Try Alpha Vantage first (free tier w/ key)
    const avKey = process.env.ALPHA_VANTAGE_KEY;
    if (avKey && avKey !== 'demo') {
        try {
            const avRes = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${avKey}`
            );
            const avData = await avRes.json();
            const q = avData['Global Quote'];
            if (q && q['05. price']) {
                return NextResponse.json({
                    ticker,
                    price: parseFloat(q['05. price']),
                    open: parseFloat(q['02. open']),
                    high: parseFloat(q['03. high']),
                    low: parseFloat(q['04. low']),
                    change: parseFloat(q['09. change']),
                    changePct: parseFloat(q['10. change percent']),
                    volume: parseInt(q['06. volume']),
                    source: 'alpha_vantage',
                });
            }
        } catch { /* fall through */ }
    }

    // Try Yahoo Finance v8 (no key needed)
    try {
        const yhRes = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Antigravity/2.0)',
                    Accept: 'application/json',
                },
                next: { revalidate: 15 },
            }
        );
        const yhData = await yhRes.json();
        const meta = yhData?.chart?.result?.[0]?.meta;
        if (meta) {
            const price = meta.regularMarketPrice ?? meta.previousClose;
            const prevClose = meta.chartPreviousClose ?? meta.previousClose;
            const change = price - prevClose;
            const changePct = prevClose ? (change / prevClose) * 100 : 0;

            return NextResponse.json({
                ticker,
                price,
                open: meta.regularMarketOpen ?? price,
                high: meta.regularMarketDayHigh ?? price,
                low: meta.regularMarketDayLow ?? price,
                change: +change.toFixed(2),
                changePct: +changePct.toFixed(2),
                volume: meta.regularMarketVolume ?? 0,
                marketCap: meta.marketCap ?? null,
                currency: meta.currency ?? 'USD',
                exchange: meta.exchangeName ?? '',
                fullName: meta.longName ?? meta.shortName ?? ticker,
                source: 'yahoo_finance',
            });
        }
    } catch { /* fall through */ }

    // Fallback: return mock from our data store
    const { STOCKS } = await import('@/lib/marketData');
    const stock = STOCKS[ticker];
    if (stock) {
        return NextResponse.json({ ...stock, source: 'mock' });
    }

    return NextResponse.json({ error: `No data for ${ticker}` }, { status: 404 });
}
