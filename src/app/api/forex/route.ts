import { NextResponse } from 'next/server';

/**
 * Forex rate proxy — Frankfurter.app (free, no key, ECB data)
 * + Historical rates for charts
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') ?? 'latest';
    const base = searchParams.get('base') ?? 'USD';
    const to = searchParams.get('to');

    try {
        if (type === 'history') {
            // Last 30 days of a specific pair
            const end = new Date().toISOString().slice(0, 10);
            const start = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
            const url = `https://api.frankfurter.app/${start}..${end}?from=${base}${to ? `&to=${to}` : ''}`;
            const res = await fetch(url, { next: { revalidate: 3600 } });
            if (!res.ok) throw new Error('Frankfurter history failed');
            const data = await res.json();
            return NextResponse.json(data);
        }

        // Latest rates
        const url = `https://api.frankfurter.app/latest?from=${base}`;
        const res = await fetch(url, { next: { revalidate: 300 } }); // 5min cache
        if (!res.ok) throw new Error('Frankfurter failed');
        const data = await res.json();
        return NextResponse.json({ ...data, source: 'frankfurter.app (ECB)' });

    } catch {
        // Fallback mock rates (USD base)
        return NextResponse.json({
            amount: 1, base: 'USD', date: new Date().toISOString().slice(0, 10),
            rates: {
                EUR: 0.9182, GBP: 0.7894, JPY: 149.82, CHF: 0.8901, CAD: 1.3612,
                AUD: 1.5284, NZD: 1.6441, CNY: 7.2341, HKD: 7.8198, SGD: 1.3421,
                KRW: 1328.4, INR: 83.14, BRL: 4.9742, MXN: 17.142, SEK: 10.412,
                NOK: 10.582, DKK: 6.8412, PLN: 3.9812, CZK: 23.142, HUF: 358.2,
                ZAR: 18.812, TRY: 31.94, RUB: 91.42, AED: 3.6725, SAR: 3.7512,
                THB: 35.12, MYR: 4.712, IDR: 15842, PHP: 56.24, VND: 24812,
            },
            source: 'mock_fallback',
        });
    }
}
