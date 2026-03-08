import { NextRequest, NextResponse } from 'next/server';

/**
 * Fear & Greed Index — alternative.me (free, no key needed)
 * Also returns global crypto market data from CoinGecko
 */
export async function GET(_req: NextRequest) {
    try {
        const [fgRes, globalRes] = await Promise.allSettled([
            fetch('https://api.alternative.me/fng/?limit=7', { next: { revalidate: 3600 } }),
            fetch('https://api.coingecko.com/api/v3/global', { next: { revalidate: 60 } }),
        ]);

        const fg = fgRes.status === 'fulfilled' && fgRes.value.ok
            ? await fgRes.value.json() : null;
        const global = globalRes.status === 'fulfilled' && globalRes.value.ok
            ? await globalRes.value.json() : null;

        if (!fg || !global || !fg.data || !global.data) {
            throw new Error('Failed to fetch real-time sentiment or global market data.');
        }

        const fgData = fg.data[0];
        const globalData = global.data;

        return NextResponse.json({
            fear_greed: {
                value: parseInt(fgData.value),
                label: fgData.value_classification,
                timestamp: fgData.timestamp,
                history: fg.data.map((d: { value: string; value_classification: string }) => ({
                    value: parseInt(d.value), label: d.value_classification
                })),
            },
            global_market: {
                total_market_cap_usd: globalData.total_market_cap?.usd ?? 0,
                total_volume_24h_usd: globalData.total_volume?.usd ?? 0,
                btc_dominance: globalData.market_cap_percentage?.btc ?? 0,
                eth_dominance: globalData.market_cap_percentage?.eth ?? 0,
                market_cap_change_24h: globalData.market_cap_change_percentage_24h_usd ?? 0,
                active_cryptocurrencies: globalData.active_cryptocurrencies ?? 0,
            },
            source: 'alternative.me + coingecko',
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 502 });
    }
}
