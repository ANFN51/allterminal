'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, UTCTimestamp } from 'lightweight-charts';
import { getWsClient } from '@/lib/wsClient';

interface CandlestickChartProps {
    ticker: string;
    height?: number;
    currency?: string;
}

type Range = '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y';

const RANGES: Range[] = ['5d', '1mo', '3mo', '6mo', '1y', '2y', '5y'];

interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export default function CandlestickChart({ ticker, height = 340, currency }: CandlestickChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candleSeriesRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const volSeriesRef = useRef<any>(null);

    const [range, setRange] = useState<Range>('1y');
    const [source, setSource] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [livePrice, setLivePrice] = useState<number | null>(null);
    const [crosshairOHLC, setCrosshairOHLC] = useState<{ o: number; h: number; l: number; c: number; v: number } | null>(null);

    // Build/destroy the chart only once per ticker
    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            width: containerRef.current.clientWidth,
            height: (height || 340) - 48,
            layout: {
                background: { type: ColorType.Solid, color: '#08090d' },
                textColor: '#8B8FA8',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
            },
            grid: {
                vertLines: { color: 'rgba(255,140,0,0.05)' },
                horzLines: { color: 'rgba(255,140,0,0.05)' },
            },
            crosshair: {
                mode: 1,
                vertLine: { color: 'rgba(255,140,0,0.4)', labelBackgroundColor: '#FF8C00' },
                horzLine: { color: 'rgba(255,140,0,0.4)', labelBackgroundColor: '#FF8C00' },
            },
            rightPriceScale: {
                borderColor: 'rgba(255,140,0,0.15)',
                textColor: '#8B8FA8',
            },
            timeScale: {
                borderColor: 'rgba(255,140,0,0.15)',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00C853', downColor: '#FF3D3D',
            borderUpColor: '#00C853', borderDownColor: '#FF3D3D',
            wickUpColor: '#00C853', wickDownColor: '#FF3D3D',
        });

        const volSeries = chart.addSeries(HistogramSeries, {
            color: 'rgba(255,140,0,0.3)',
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume',
        });

        chart.priceScale('volume').applyOptions({
            scaleMargins: { top: 0.85, bottom: 0 },
            borderVisible: false,
        });

        // Crosshair tooltip
        chart.subscribeCrosshairMove((param: any) => {
            if (param.seriesData && candleSeries) {
                const data = param.seriesData.get(candleSeries);
                if (data) {
                    setCrosshairOHLC({ o: data.open, h: data.high, l: data.low, c: data.close, v: 0 });
                } else {
                    setCrosshairOHLC(null);
                }
            }
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        volSeriesRef.current = volSeries;

        const ro = new ResizeObserver(() => {
            if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
        });
        ro.observe(containerRef.current);

        // Live WebSocket ticks
        const client = getWsClient();
        let lastBarTime = 0;
        const currentCandle: Candle = { time: 0, open: 0, high: 0, low: 0, close: 0, volume: 0 };

        const unsub = client.subscribe(ticker, ev => {
            setLivePrice(ev.price);
            const now = Math.floor(Date.now() / 1000);
            const barTime = now - (now % 60);
            if (barTime > lastBarTime) {
                lastBarTime = barTime;
                Object.assign(currentCandle, { time: barTime, open: ev.price, high: ev.price, low: ev.price, close: ev.price, volume: ev.volume });
            } else {
                currentCandle.close = ev.price;
                currentCandle.high = Math.max(currentCandle.high, ev.price);
                currentCandle.low = Math.min(currentCandle.low, ev.price);
                currentCandle.volume += ev.volume;
            }
            candleSeriesRef.current?.update({
                time: currentCandle.time as UTCTimestamp,
                open: currentCandle.open, high: currentCandle.high,
                low: currentCandle.low, close: currentCandle.close,
            });
        });

        return () => {
            unsub();
            ro.disconnect();
            chart.remove();
            chartRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticker]);

    // Load chart data on ticker or range change
    useEffect(() => {
        if (!candleSeriesRef.current || !volSeriesRef.current || !chartRef.current) return;
        setLoading(true);

        async function loadData() {
            try {
                const res = await fetch(`/api/chart?ticker=${encodeURIComponent(ticker)}&range=${range}&interval=1d`);
                if (!res.ok) throw new Error('chart api failed');
                const data = await res.json();
                const candles: Candle[] = data.candles ?? [];
                if (!candles.length) throw new Error('empty');
                setSource(data.source === 'yahoo_finance' ? '● LIVE · Yahoo Finance' : '● MOCK DATA');
                applyData(candles);
            } catch {
                setSource('● ERROR: API UNAVAILABLE');
            } finally {
                setLoading(false);
            }
        }

        function applyData(candles: Candle[]) {
            const sorted = [...candles].sort((a, b) => a.time - b.time);
            try {
                candleSeriesRef.current?.setData(sorted.map(c => ({
                    time: c.time as UTCTimestamp,
                    open: c.open, high: c.high, low: c.low, close: c.close,
                })));
                volSeriesRef.current?.setData(sorted.map(c => ({
                    time: c.time as UTCTimestamp,
                    value: c.volume,
                    color: c.close >= c.open ? 'rgba(0,200,83,0.4)' : 'rgba(255,61,61,0.4)',
                })));
                chartRef.current?.timeScale().fitContent();
            } catch { /* chart may have been removed */ }
        }

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticker, range]);

    const displayPrice = livePrice;
    const currencySymbol = (currency && currency !== 'USD') ? '' : '$';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px',
                borderBottom: '1px solid var(--border)', background: 'var(--bg-panel-alt)', flexShrink: 0, flexWrap: 'wrap',
            }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)', letterSpacing: 2 }}>{ticker}</span>
                {displayPrice != null && (
                    <>
                        <span style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                            {currencySymbol}{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </span>
                    </>
                )}
                {/* Crosshair OHLC */}
                {crosshairOHLC && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                        <InfoChip label="O" value={crosshairOHLC.o.toFixed(2)} />
                        <InfoChip label="H" value={crosshairOHLC.h.toFixed(2)} />
                        <InfoChip label="L" value={crosshairOHLC.l.toFixed(2)} />
                        <InfoChip label="C" value={crosshairOHLC.c.toFixed(2)} />
                    </span>
                )}
                <div style={{ flex: 1 }} />
                {loading && <span style={{ fontSize: 9, color: 'var(--amber)', animation: 'pulse 1s infinite' }}>⟳ LOADING...</span>}
                <span style={{ fontSize: 8, color: source.startsWith('●') ? 'var(--green)' : 'var(--text-dim)' }}>{source}</span>
                {/* Range selector */}
                <div style={{ display: 'flex', gap: 3 }}>
                    {RANGES.map(r => (
                        <button key={r} onClick={() => setRange(r)}
                            style={{
                                background: range === r ? 'var(--amber)' : 'transparent',
                                color: range === r ? 'var(--bg-void)' : 'var(--text-muted)',
                                border: '1px solid ' + (range === r ? 'var(--amber)' : 'var(--border)'),
                                borderRadius: 2, padding: '1px 5px', fontSize: 9, cursor: 'pointer', fontWeight: 700,
                            }}>{r.toUpperCase()}</button>
                    ))}
                </div>
            </div>
            <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
        </div>
    );
}

function InfoChip({ label, value }: { label: string; value: string }) {
    return (
        <span style={{ display: 'flex', gap: 3, fontSize: 10 }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
            <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        </span>
    );
}
