import { NextResponse } from 'next/server';

/**
 * Grabs real global exchange volumes from CoinGecko.
 * Since CoinGecko does not provide "inflow/outflow" for free, we use the 24h trailing volume
 * to infer market activity magnitude.
 */
export async function GET() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/exchanges?per_page=10&page=1', {
            headers: {
                Accept: 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; Allterminals/2.0)',
            },
            next: { revalidate: 300 }, // Cache 5 min
        });

        if (!res.ok) {
            throw new Error(`CoinGecko returned status: ${res.status}`);
        }

        const data = await res.json();

        // Map CoinGecko exchange data into a digestible format
        const mapped = data.map((ex: any) => ({
            id: ex.id,
            name: ex.name,
            trust_score: ex.trust_score,
            volume_24h_btc: ex.trade_volume_24h_btc_normalized || ex.trade_volume_24h_btc || 0,
            url: ex.url,
            image: ex.image
        }));

        return NextResponse.json(mapped);
    } catch (error: any) {
        return NextResponse.json(
            { error: `Failed to fetch exchange data: ${error.message}` },
            { status: 502 }
        );
    }
}
