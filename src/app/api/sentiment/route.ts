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

        const fgData = fg?.data?.[0];
        const globalData = global?.data;

        return NextResponse.json({
            fear_greed: {
                value: fgData ? parseInt(fgData.value) : 62,
                label: fgData?.value_classification ?? 'Greed',
                timestamp: fgData?.timestamp ?? Date.now() / 1000,
                history: fg?.data?.map((d: { value: string; value_classification: string }) => ({
                    value: parseInt(d.value), label: d.value_classification
                })) ?? [],
            },
            global_market: {
                total_market_cap_usd: globalData?.total_market_cap?.usd ?? 3_200_000_000_000,
                total_volume_24h_usd: globalData?.total_volume?.usd ?? 140_000_000_000,
                btc_dominance: globalData?.market_cap_percentage?.btc ?? 52.4,
                eth_dominance: globalData?.market_cap_percentage?.eth ?? 14.8,
                market_cap_change_24h: globalData?.market_cap_change_percentage_24h_usd ?? 1.24,
                active_cryptocurrencies: globalData?.active_cryptocurrencies ?? 15842,
            },
            source: fgData ? 'alternative.me + coingecko' : 'mock',
        });
    } catch {
        return NextResponse.json({
            fear_greed: { value: 62, label: 'Greed', timestamp: Date.now() / 1000, history: [] },
            global_market: {
                total_market_cap_usd: 3_200_000_000_000,
                total_volume_24h_usd: 140_000_000_000,
                btc_dominance: 52.4, eth_dominance: 14.8,
                market_cap_change_24h: 1.24,
                active_cryptocurrencies: 15842,
            },
            source: 'mock',
        });
    }
}
