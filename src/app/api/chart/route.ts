import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

/**
 * Enhanced Yahoo Finance chart proxy
 * Uses yahoo-finance2 to bypass 429/401 rate blocks.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ticker = (searchParams.get('ticker') ?? 'AAPL').toUpperCase();
    const range = searchParams.get('range') ?? '1y';
    const interval = searchParams.get('interval') ?? '1d';

    try {
        let period1 = new Date();
        switch (range) {
            case '1d': period1.setDate(period1.getDate() - 1); break;
            case '5d': period1.setDate(period1.getDate() - 5); break;
            case '1mo': period1.setMonth(period1.getMonth() - 1); break;
            case '3mo': period1.setMonth(period1.getMonth() - 3); break;
            case '6mo': period1.setMonth(period1.getMonth() - 6); break;
            case '1y': period1.setFullYear(period1.getFullYear() - 1); break;
            case '2y': period1.setFullYear(period1.getFullYear() - 2); break;
            case '5y': period1.setFullYear(period1.getFullYear() - 5); break;
            default: period1.setFullYear(period1.getFullYear() - 1); break;
        }

        const validIntervals = ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'];
        const safeInterval = validIntervals.includes(interval) ? interval : '1d';

        // Using YahooFinance.chart returns { meta, quotes } 
        const result = await yahooFinance.chart(ticker, {
            period1: period1,
            interval: safeInterval as any
        });

        if (!result || !result.quotes || result.quotes.length === 0) {
            throw new Error('No chart result');
        }

        const candles = result.quotes.map((q: any) => ({
            time: Math.floor(q.date.getTime() / 1000),
            open: q.open ? +q.open.toFixed(4) : (q.close ? +q.close.toFixed(4) : 0),
            high: q.high ? +q.high.toFixed(4) : (q.close ? +q.close.toFixed(4) : 0),
            low: q.low ? +q.low.toFixed(4) : (q.close ? +q.close.toFixed(4) : 0),
            close: q.close ? +q.close.toFixed(4) : 0,
            volume: q.volume || 0,
        })).filter((c: any) => c.close > 0 && c.time > 0);

        return NextResponse.json({
            ticker,
            currency: result.meta?.currency ?? 'USD',
            exchange: result.meta?.exchangeName ?? '',
            longName: result.meta?.longName ?? ticker,
            candles,
            source: 'yahoo_finance_2',
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 502 });
    }
}
