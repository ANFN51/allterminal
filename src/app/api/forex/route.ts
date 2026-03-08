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

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 502 });
    }
}
