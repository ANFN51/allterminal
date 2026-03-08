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

// Mock crypto data (fallback when CoinGecko is unavailable)
export const MOCK_CRYPTO: CryptoAsset[] = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', image: '', current_price: 87420, market_cap: 1_720_000_000_000, market_cap_rank: 1, price_change_percentage_24h: 2.14, total_volume: 38_000_000_000, circulating_supply: 19_600_000, ath: 108000, ath_change_percentage: -19.1, category: 'Layer 1', ...ON_CHAIN_METRICS.bitcoin },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', image: '', current_price: 3218.50, market_cap: 387_000_000_000, market_cap_rank: 2, price_change_percentage_24h: 1.87, total_volume: 18_000_000_000, circulating_supply: 120_000_000, ath: 4878, ath_change_percentage: -34.1, category: 'Layer 1', ...ON_CHAIN_METRICS.ethereum },
    { id: 'tether', symbol: 'USDT', name: 'Tether', image: '', current_price: 1.000, market_cap: 144_000_000_000, market_cap_rank: 3, price_change_percentage_24h: 0.01, total_volume: 95_000_000_000, circulating_supply: 144_000_000_000, ath: 1.32, ath_change_percentage: -24.2, category: 'Stablecoin' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', image: '', current_price: 598.40, market_cap: 87_000_000_000, market_cap_rank: 4, price_change_percentage_24h: -0.52, total_volume: 2_100_000_000, circulating_supply: 145_800_000, ath: 717, ath_change_percentage: -16.6, category: 'Exchange Token' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', image: '', current_price: 142.30, market_cap: 65_000_000_000, market_cap_rank: 5, price_change_percentage_24h: -1.23, total_volume: 4_200_000_000, circulating_supply: 457_000_000, ath: 259.9, ath_change_percentage: -45.2, category: 'Layer 1', ...ON_CHAIN_METRICS.solana },
    { id: 'ripple', symbol: 'XRP', name: 'XRP', image: '', current_price: 0.6210, market_cap: 34_000_000_000, market_cap_rank: 6, price_change_percentage_24h: 0.84, total_volume: 2_800_000_000, circulating_supply: 55_000_000_000, ath: 3.40, ath_change_percentage: -81.7, category: 'Layer 1' },
    { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', image: '', current_price: 1.000, market_cap: 43_000_000_000, market_cap_rank: 7, price_change_percentage_24h: 0.00, total_volume: 8_800_000_000, circulating_supply: 43_000_000_000, ath: 1.17, ath_change_percentage: -14.5, category: 'Stablecoin' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', image: '', current_price: 0.5810, market_cap: 20_500_000_000, market_cap_rank: 8, price_change_percentage_24h: 1.20, total_volume: 780_000_000, circulating_supply: 35_300_000_000, ath: 3.09, ath_change_percentage: -81.2, category: 'Layer 1' },
    { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', image: '', current_price: 38.20, market_cap: 16_000_000_000, market_cap_rank: 9, price_change_percentage_24h: -0.90, total_volume: 680_000_000, circulating_supply: 418_000_000, ath: 144.96, ath_change_percentage: -73.7, category: 'Layer 1', ...ON_CHAIN_METRICS.avalanche },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', image: '', current_price: 0.1502, market_cap: 20_400_000_000, market_cap_rank: 10, price_change_percentage_24h: 3.40, total_volume: 2_100_000_000, circulating_supply: 144_000_000_000, ath: 0.74, ath_change_percentage: -79.7, category: 'Meme' },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', image: '', current_price: 7.84, market_cap: 11_000_000_000, market_cap_rank: 11, price_change_percentage_24h: -1.50, total_volume: 480_000_000, circulating_supply: 1_400_000_000, ath: 55.0, ath_change_percentage: -85.8, category: 'Layer 0' },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', image: '', current_price: 16.20, market_cap: 9_800_000_000, market_cap_rank: 12, price_change_percentage_24h: 0.65, total_volume: 620_000_000, circulating_supply: 604_000_000, ath: 52.7, ath_change_percentage: -69.3, category: 'Oracle' },
    { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', image: '', current_price: 9.80, market_cap: 7_400_000_000, market_cap_rank: 13, price_change_percentage_24h: -0.30, total_volume: 310_000_000, circulating_supply: 756_000_000, ath: 44.9, ath_change_percentage: -78.2, category: 'DeFi', ...ON_CHAIN_METRICS.uniswap },
    { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu', image: '', current_price: 0.0000248, market_cap: 14_600_000_000, market_cap_rank: 14, price_change_percentage_24h: 4.80, total_volume: 1_200_000_000, circulating_supply: 589_000_000_000_000, ath: 0.000088, ath_change_percentage: -71.8, category: 'Meme' },
    { id: 'matic-network', symbol: 'MATIC', name: 'Polygon', image: '', current_price: 0.9210, market_cap: 8_600_000_000, market_cap_rank: 15, price_change_percentage_24h: -2.10, total_volume: 580_000_000, circulating_supply: 9_300_000_000, ath: 2.92, ath_change_percentage: -68.5, category: 'Layer 2', ...ON_CHAIN_METRICS['matic-network'] },
    { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', image: '', current_price: 88.40, market_cap: 6_600_000_000, market_cap_rank: 16, price_change_percentage_24h: 0.42, total_volume: 520_000_000, circulating_supply: 74_800_000, ath: 412.9, ath_change_percentage: -78.6, category: 'Layer 1' },
    { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol', image: '', current_price: 6.84, market_cap: 7_400_000_000, market_cap_rank: 17, price_change_percentage_24h: 1.60, total_volume: 420_000_000, circulating_supply: 1_080_000_000, ath: 20.4, ath_change_percentage: -66.5, category: 'Layer 1' },
    { id: 'aave', symbol: 'AAVE', name: 'Aave', image: '', current_price: 192.40, market_cap: 2_900_000_000, market_cap_rank: 18, price_change_percentage_24h: 0.90, total_volume: 210_000_000, circulating_supply: 15_100_000, ath: 666.9, ath_change_percentage: -71.2, category: 'DeFi', ...ON_CHAIN_METRICS.aave },
    { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', image: '', current_price: 0.8820, market_cap: 3_600_000_000, market_cap_rank: 19, price_change_percentage_24h: -1.80, total_volume: 280_000_000, circulating_supply: 4_080_000_000, ath: 2.39, ath_change_percentage: -63.1, category: 'Layer 2' },
    { id: 'maker', symbol: 'MKR', name: 'Maker', image: '', current_price: 2148.0, market_cap: 2_000_000_000, market_cap_rank: 20, price_change_percentage_24h: 0.40, total_volume: 120_000_000, circulating_supply: 930_000, ath: 6292, ath_change_percentage: -65.8, category: 'DeFi', ...ON_CHAIN_METRICS.maker },
    { id: 'fetch-ai', symbol: 'FET', name: 'Fetch.ai', image: '', current_price: 1.840, market_cap: 4_700_000_000, market_cap_rank: 21, price_change_percentage_24h: 5.20, total_volume: 380_000_000, circulating_supply: 2_560_000_000, ath: 3.43, ath_change_percentage: -46.4, category: 'AI Token' },
    { id: 'render-network', symbol: 'RNDR', name: 'Render', image: '', current_price: 7.240, market_cap: 3_800_000_000, market_cap_rank: 22, price_change_percentage_24h: 3.80, total_volume: 280_000_000, circulating_supply: 525_000_000, ath: 13.6, ath_change_percentage: -46.8, category: 'AI Token' },
    { id: 'the-graph', symbol: 'GRT', name: 'The Graph', image: '', current_price: 0.2840, market_cap: 2_690_000_000, market_cap_rank: 23, price_change_percentage_24h: 2.10, total_volume: 180_000_000, circulating_supply: 9_480_000_000, ath: 2.88, ath_change_percentage: -90.1, category: 'AI Token' },
    { id: 'singularitynet', symbol: 'AGIX', name: 'SingularityNET', image: '', current_price: 0.6420, market_cap: 890_000_000, market_cap_rank: 24, price_change_percentage_24h: 6.40, total_volume: 95_000_000, circulating_supply: 1_390_000_000, ath: 1.87, ath_change_percentage: -65.7, category: 'AI Token' },
    { id: 'sui', symbol: 'SUI', name: 'Sui', image: '', current_price: 1.620, market_cap: 4_500_000_000, market_cap_rank: 25, price_change_percentage_24h: -0.70, total_volume: 380_000_000, circulating_supply: 2_780_000_000, ath: 2.18, ath_change_percentage: -25.7, category: 'Layer 1' },
    { id: 'aptos', symbol: 'APT', name: 'Aptos', image: '', current_price: 9.40, market_cap: 4_100_000_000, market_cap_rank: 26, price_change_percentage_24h: -1.20, total_volume: 290_000_000, circulating_supply: 436_000_000, ath: 19.9, ath_change_percentage: -52.8, category: 'Layer 1' },
    { id: 'lido-dao', symbol: 'LDO', name: 'Lido DAO', image: '', current_price: 1.480, market_cap: 1_330_000_000, market_cap_rank: 27, price_change_percentage_24h: -0.50, total_volume: 98_000_000, circulating_supply: 898_000_000, ath: 6.41, ath_change_percentage: -76.9, category: 'DeFi', ...ON_CHAIN_METRICS['lido-dao'] },
    { id: 'celestia', symbol: 'TIA', name: 'Celestia', image: '', current_price: 5.820, market_cap: 1_760_000_000, market_cap_rank: 28, price_change_percentage_24h: 2.30, total_volume: 140_000_000, circulating_supply: 302_000_000, ath: 21.4, ath_change_percentage: -72.8, category: 'Layer 0' },
    { id: 'the-sandbox', symbol: 'SAND', name: 'The Sandbox', image: '', current_price: 0.3920, market_cap: 860_000_000, market_cap_rank: 29, price_change_percentage_24h: -1.10, total_volume: 82_000_000, circulating_supply: 2_200_000_000, ath: 8.40, ath_change_percentage: -95.3, category: 'GameFi' },
    { id: 'optimism', symbol: 'OP', name: 'Optimism', image: '', current_price: 1.840, market_cap: 1_900_000_000, market_cap_rank: 30, price_change_percentage_24h: -2.40, total_volume: 210_000_000, circulating_supply: 1_030_000_000, ath: 4.84, ath_change_percentage: -62.0, category: 'Layer 2' },
];

export async function fetchCryptoMarket(): Promise<CryptoAsset[]> {
    try {
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
    } catch {
        // Return mock data on failure
        return MOCK_CRYPTO;
    }
}

export function formatCryptoPrice(price: number): string {
    if (price >= 10000) return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    if (price >= 0.01) return price.toFixed(6);
    return price.toFixed(8);
}

// Whale alert mock feed
export function generateWhaleAlerts() {
    const txTypes = ['Transfer', 'Exchange Inflow', 'Exchange Outflow', 'Staking', 'Mint'];
    const coins = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC'];
    const exchanges = ['Binance', 'Coinbase', 'OKX', 'Bybit', 'Kraken', 'Unknown Wallet'];
    const rng = () => Math.random();

    return Array.from({ length: 20 }, (_, i) => {
        const coin = coins[Math.floor(rng() * coins.length)];
        const type = txTypes[Math.floor(rng() * txTypes.length)];
        const amount = Math.floor(100 + rng() * 10000);
        const price = coin === 'BTC' ? 87420 : coin === 'ETH' ? 3218 : coin === 'SOL' ? 142 : 1;
        const valueUsd = amount * price;
        const from = exchanges[Math.floor(rng() * exchanges.length)];
        const to = exchanges[Math.floor(rng() * exchanges.length)];

        return {
            id: i,
            coin, type, amount, valueUsd, from, to,
            txHash: `0x${Math.random().toString(16).slice(2, 14)}...${Math.random().toString(16).slice(2, 6)}`,
            timestamp: Date.now() - i * 180_000,
        };
    });
}
