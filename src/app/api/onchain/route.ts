import { NextRequest, NextResponse } from 'next/server';

/**
 * Blockchain.info + CoinGecko — BTC on-chain data, no key needed
 * Provides: hash rate, difficulty, mempool size, tx count, fees
 */
export async function GET(_req: NextRequest) {
    try {
        const [statsRes, mempoolRes, feeRes] = await Promise.allSettled([
            fetch('https://blockchain.info/stats?format=json', { next: { revalidate: 60 } }),
            fetch('https://api.blockcypher.com/v1/btc/main', { next: { revalidate: 30 } }),
            fetch('https://mempool.space/api/v1/fees/recommended', { next: { revalidate: 30 } }),
        ]);

        const stats = statsRes.status === 'fulfilled' && statsRes.value.ok
            ? await statsRes.value.json() : null;
        const mempool = mempoolRes.status === 'fulfilled' && mempoolRes.value.ok
            ? await mempoolRes.value.json() : null;
        const fees = feeRes.status === 'fulfilled' && feeRes.value.ok
            ? await feeRes.value.json() : null;

        if (!stats || !mempool || !fees) {
            throw new Error('One or more on-chain data providers failed to return valid data.');
        }

        return NextResponse.json({
            // blockchain.info
            hash_rate: (stats.hash_rate / 1e18).toFixed(2) + ' EH/s',
            difficulty: stats.difficulty.toLocaleString(),
            total_fees_btc: (stats.total_fees_btc / 1e8).toFixed(4),
            n_tx: stats.n_tx,
            minutes_between_blocks: stats.minutes_between_blocks?.toFixed(1) ?? '10.0',
            market_price_usd: stats.market_price_usd,
            // blockcypher mempool
            unconfirmed_count: mempool.unconfirmed_count,
            mempool_size_bytes: mempool.unconfirmed_size ? (mempool.unconfirmed_size / 1e6).toFixed(1) + ' MB' : '0 MB',
            // mempool.space fees
            fee_fastest: fees.fastestFee,
            fee_half_hour: fees.halfHourFee,
            fee_hour: fees.hourFee,
            fee_economy: fees.economyFee,
            source: 'blockchain.info + blockcypher',
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 502 });
    }
}
