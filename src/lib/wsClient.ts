// ============================================================
// WEBSOCKET CLIENT — Real-time mock price updates
// ============================================================

export type TickEvent = {
    ticker: string;
    price: number;
    bid: number;
    ask: number;
    volume: number;
    timestamp: number;
};

type TickHandler = (event: TickEvent) => void;

class MockWebSocketClient {
    private handlers: Map<string, Set<TickHandler>> = new Map();
    private prices: Map<string, number> = new Map();
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private rng: () => number;

    constructor() {
        // Seeded random for consistent simulation
        let seed = 12345;
        this.rng = () => {
            seed = (seed * 1664525 + 1013904223) & 0xffffffff;
            return (seed >>> 0) / 0xffffffff;
        };

        // Seed starting prices
        const startPrices: Record<string, number> = {
            AAPL: 189.30, MSFT: 415.52, GOOGL: 165.22, AMZN: 195.40, META: 528.60,
            NVDA: 875.40, TSLA: 172.28, JPM: 235.70, SPY: 507.86, QQQ: 435.44,
            BTC: 87420, ETH: 3218.50, SOL: 142.30, BNB: 598.40, XRP: 0.6210,
            DOGE: 0.1502, ADA: 0.5810, AVAX: 38.20, DOT: 7.84, LINK: 16.20,
        };
        for (const [k, v] of Object.entries(startPrices)) {
            this.prices.set(k, v);
        }
    }

    subscribe(ticker: string, handler: TickHandler) {
        if (!this.handlers.has(ticker)) {
            this.handlers.set(ticker, new Set());
        }
        this.handlers.get(ticker)!.add(handler);
        this.startIfNeeded();
        return () => this.unsubscribe(ticker, handler);
    }

    unsubscribe(ticker: string, handler: TickHandler) {
        this.handlers.get(ticker)?.delete(handler);
        if (this.countSubscriptions() === 0) this.stop();
    }

    subscribeAll(handler: TickHandler): () => void {
        const unsubs = Array.from(this.prices.keys()).map(t => this.subscribe(t, handler));
        return () => unsubs.forEach(u => u());
    }

    private countSubscriptions() {
        return Array.from(this.handlers.values()).reduce((sum, s) => sum + s.size, 0);
    }

    private startIfNeeded() {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => this.tick(), 300);
    }

    private stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private tick() {
        // Pick a random subset of tickers to update
        const tickers = Array.from(this.handlers.keys());
        const toUpdate = tickers.filter(() => this.rng() > 0.3);

        for (const ticker of toUpdate) {
            const current = this.prices.get(ticker) ?? 100;
            const volatility = ticker === 'BTC' ? 0.0008 : ticker === 'ETH' ? 0.0010 : 0.0003;
            const change = (this.rng() - 0.5) * 2 * volatility * current;
            const newPrice = Math.max(current + change, 0.001);
            this.prices.set(ticker, newPrice);

            const spread = newPrice * 0.0001;
            const event: TickEvent = {
                ticker,
                price: +newPrice.toFixed(ticker === 'BTC' ? 2 : 4),
                bid: +(newPrice - spread).toFixed(4),
                ask: +(newPrice + spread).toFixed(4),
                volume: Math.floor(100 + this.rng() * 10000),
                timestamp: Date.now(),
            };

            for (const handler of this.handlers.get(ticker) ?? []) {
                handler(event);
            }
        }
    }
}

// Singleton instance
let _client: MockWebSocketClient | null = null;

export function getWsClient(): MockWebSocketClient {
    if (!_client) _client = new MockWebSocketClient();
    return _client;
}
