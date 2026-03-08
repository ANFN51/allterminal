// ============================================================
// COINGECKO API — Crypto market data (no API key needed)
// ============================================================

export interface CryptoAsset {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d_in_currency?: number;
    total_volume: number;
    circulating_supply: number;
    ath: number;
    ath_change_percentage: number;
    category: string;
    // Simulated on-chain
    tvl?: number;
    protocol_revenue_30d?: number;
    active_addresses_24h?: number;
}

// Category classification
const CRYPTO_CATEGORIES: Record<string, string> = {
    bitcoin: 'Layer 1',
    ethereum: 'Layer 1',
    tether: 'Stablecoin',
    'binancecoin': 'Exchange Token',
    solana: 'Layer 1',
    ripple: 'Layer 1',
    'usd-coin': 'Stablecoin',
    cardano: 'Layer 1',
    avalanche: 'Layer 1',
    dogecoin: 'Meme',
    polkadot: 'Layer 0',
    chainlink: 'Oracle',
    uniswap: 'DeFi',
    'shiba-inu': 'Meme',
    'wrapped-bitcoin': 'Wrapped',
    'matic-network': 'Layer 2',
    litecoin: 'Layer 1',
    'internet-computer': 'Layer 1',
    filecoin: 'Storage',
    aave: 'DeFi',
    'arbitrum': 'Layer 2',
    optimism: 'Layer 2',
    'fetch-ai': 'AI Token',
    'singularitynet': 'AI Token',
    'ocean-protocol': 'AI Token',
    'render-network': 'AI Token',
    'the-graph': 'AI Token',
    near: 'Layer 1',
    cosmos: 'Layer 0',
    hedera: 'Layer 1',
    maker: 'DeFi',
    'curve-dao-token': 'DeFi',
    'lido-dao': 'DeFi',
    'rocket-pool': 'DeFi',
    celestia: 'Layer 0',
    sui: 'Layer 1',
    aptos: 'Layer 1',
    'injective-protocol': 'DeFi',
    'the-sandbox': 'GameFi',
    decentraland: 'GameFi',
    axie: 'GameFi',
};

// Simulated on-chain metrics
const ON_CHAIN_METRICS: Record<string, { tvl?: number; revenue?: number; addresses?: number }> = {
    ethereum: { tvl: 47_000_000_000, revenue: 320_000_000, addresses: 1_200_000 },
    solana: { tvl: 4_200_000_000, revenue: 28_000_000, addresses: 850_000 },
    bitcoin: { tvl: 0, revenue: 0, addresses: 980_000 },
    avalanche: { tvl: 1_100_000_000, revenue: 8_500_000, addresses: 220_000 },
    'matic-network': { tvl: 1_300_000_000, revenue: 12_000_000, addresses: 650_000 },
    aave: { tvl: 12_400_000_000, revenue: 45_000_000, addresses: 85_000 },
    uniswap: { tvl: 5_800_000_000, revenue: 180_000_000, addresses: 420_000 },
    maker: { tvl: 8_600_000_000, revenue: 95_000_000, addresses: 62_000 },
    'curve-dao-token': { tvl: 2_100_000_000, revenue: 28_000_000, addresses: 38_000 },
    'lido-dao': { tvl: 31_000_000_000, revenue: 280_000_000, addresses: 180_000 },
};

export async function fetchCryptoMarket(): Promise<CryptoAsset[]> {
    const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=7d',
        { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error('CoinGecko error');
    const data = await res.json();
    return data.map((coin: CryptoAsset) => ({
        ...coin,
        category: CRYPTO_CATEGORIES[coin.id] ?? 'Other',
        tvl: ON_CHAIN_METRICS[coin.id]?.tvl,
        protocol_revenue_30d: ON_CHAIN_METRICS[coin.id]?.revenue,
        active_addresses_24h: ON_CHAIN_METRICS[coin.id]?.addresses,
    }));
}

export function formatCryptoPrice(price: number): string {
    if (price >= 10000) return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    if (price >= 0.01) return price.toFixed(6);
    return price.toFixed(8);
}


