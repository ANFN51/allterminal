// ============================================================
// POLLING CLIENT — Abstracted real-time price updates via /api/quote
// Replaces the previous MockWebSocketClient.
// ============================================================

export type TickEvent = {
    ticker: string;
    price: number;
    bid: number;
    ask: number;
    volume: number;
    timestamp: number;
    change?: number;
    changePct?: number;
};

type TickHandler = (event: TickEvent) => void;

class PollingPriceClient {
    private handlers: Map<string, Set<TickHandler>> = new Map();
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private isFetching = false;

    subscribe(ticker: string, handler: TickHandler) {
        const uTicker = ticker.toUpperCase();
        if (!this.handlers.has(uTicker)) {
            this.handlers.set(uTicker, new Set());
        }
        this.handlers.get(uTicker)!.add(handler);
        this.startIfNeeded();
        return () => this.unsubscribe(uTicker, handler);
    }

    unsubscribe(ticker: string, handler: TickHandler) {
        const uTicker = ticker.toUpperCase();
        this.handlers.get(uTicker)?.delete(handler);
        if (this.countSubscriptions() === 0) this.stop();
    }

    private countSubscriptions() {
        return Array.from(this.handlers.values()).reduce((sum, s) => sum + s.size, 0);
    }

    private startIfNeeded() {
        if (this.intervalId) return;
        // Poll every 10 seconds
        this.intervalId = setInterval(() => this.tick(), 10000);
        // Do an immediate fetch payload on first connection
        setTimeout(() => this.tick(), 100);
    }

    private stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private async tick() {
        if (this.isFetching) return;

        const tickers = Array.from(this.handlers.keys());
        if (tickers.length === 0) return;

        this.isFetching = true;
        try {
            // Batch process in chunks of 20 to respect reasonable URI limits and rate limits
            for (let i = 0; i < tickers.length; i += 20) {
                const chunk = tickers.slice(i, i + 20);
                const res = await fetch(`/api/quote?tickers=${encodeURIComponent(chunk.join(','))}`);
                if (!res.ok) continue;

                const data = await res.json();
                const quotes = Array.isArray(data) ? data : [data];

                for (const q of quotes) {
                    if (!q || !q.ticker) continue;
                    const event: TickEvent = {
                        ticker: q.ticker,
                        price: q.price,
                        bid: q.price,
                        ask: q.price,
                        volume: q.volume,
                        timestamp: Date.now(),
                        change: q.change,
                        changePct: q.changePct,
                    };

                    const handlers = this.handlers.get(q.ticker) ?? [];
                    for (const handler of handlers) {
                        handler(event);
                    }
                }
            }
        } catch (err) {
            console.error('Polling failed', err);
        } finally {
            this.isFetching = false;
        }
    }
}

// Singleton instance
let _client: PollingPriceClient | null = null;

export function getWsClient(): PollingPriceClient {
    if (!_client) _client = new PollingPriceClient();
    return _client;
}
