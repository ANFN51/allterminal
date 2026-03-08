import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

/**
 * Enhanced Yahoo Finance proxy
 * Utilizes yahoo-finance2 to gracefully manage sessions, crubs, and headers.
 */
export async function GET(req: NextRequest) {
    const singleTicker = req.nextUrl.searchParams.get('ticker')?.toUpperCase();
    const batchTickers = req.nextUrl.searchParams.get('tickers')?.toUpperCase();

    if (!singleTicker && !batchTickers) {
        return NextResponse.json({ error: 'Missing ticker or tickers parameter' }, { status: 400 });
    }

    const isBatch = !!batchTickers;
    const symbols = isBatch ? batchTickers : singleTicker;

    // De-duplicate and ignore empty strings
    const uniqueSymbols = Array.from(new Set(symbols!.split(',').map(s => s.trim()).filter(Boolean)));

    try {
        const results = await yahooFinance.quote(uniqueSymbols);
        const resultsArr = Array.isArray(results) ? results : [results];

        if (!resultsArr || resultsArr.length === 0) {
            return NextResponse.json({ error: `No data for ${symbols}` }, { status: 404 });
        }

        const mappedQuotes = resultsArr.map((q: any) => ({
            ticker: q.symbol,
            price: q.regularMarketPrice ?? q.regularMarketPreviousClose ?? 0,
            open: q.regularMarketOpen ?? 0,
            high: q.regularMarketDayHigh ?? 0,
            low: q.regularMarketDayLow ?? 0,
            change: q.regularMarketChange ?? 0,
            changePct: q.regularMarketChangePercent ?? 0,
            volume: q.regularMarketVolume ?? 0,
            marketCap: q.marketCap ?? null,
            pe: q.trailingPE ?? null,
            currency: q.currency ?? 'USD',
            exchange: q.fullExchangeName ?? q.exchange ?? '',
            fullName: q.longName ?? q.shortName ?? q.symbol,
            source: 'yahoo_finance_2',
        }));

        if (isBatch) {
            return NextResponse.json(mappedQuotes);
        } else {
            return NextResponse.json(mappedQuotes[0]);
        }
    } catch (err: any) {
        return NextResponse.json({ error: `Failed to fetch quote data: ${err.message}` }, { status: 502 });
    }
}
