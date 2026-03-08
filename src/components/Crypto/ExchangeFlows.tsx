'use client';
import { useEffect, useState } from 'react';

interface ExchangeData {
    id: string;
    name: string;
    trust_score: number;
    volume_24h_btc: number;
    url: string;
    image: string;
}

export default function ExchangeFlows() {
    const [exchanges, setExchanges] = useState<ExchangeData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const fetchExchanges = async () => {
            try {
                const res = await fetch('/api/exchanges');
                if (!res.ok) return;
                const data = await res.json();
                if (active && Array.isArray(data)) {
                    setExchanges(data);
                }
            } catch (e) {
                // Ignore
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchExchanges();
        return () => { active = false; };
    }, []);

    const totalVolume = exchanges.reduce((acc, curr) => acc + curr.volume_24h_btc, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel-alt)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em' }}>GLOBAL EXCHANGES</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>24H REPORTED VOLUME (BTC)</span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 700 }}>
                        {loading ? 'LOADING...' : `TOTAL VOL: ${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC`}
                    </span>
                    <span className="tag tag-amber">LIVE DATA</span>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>
                        Fetching global exchange metrics...
                    </div>
                ) : exchanges.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--red)', fontSize: 11 }}>
                        Failed to load exchange data. Please try again later.
                    </div>
                ) : (
                    <div>
                        {/* Exchange table */}
                        <table>
                            <thead>
                                <tr>
                                    <th>EXCHANGE</th>
                                    <th style={{ textAlign: 'center' }}>TRUST SCORE</th>
                                    <th style={{ textAlign: 'right' }}>24H VOLUME (BTC)</th>
                                    <th style={{ textAlign: 'right' }}>MARKET SHARE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exchanges.map(ex => {
                                    const share = totalVolume > 0 ? (ex.volume_24h_btc / totalVolume) * 100 : 0;
                                    return (
                                        <tr key={ex.id}>
                                            <td style={{ fontWeight: 600 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={ex.image} alt={ex.name} width={20} height={20} style={{ borderRadius: '50%' }} />
                                                    <a href={ex.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                                        {ex.name}
                                                    </a>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`tag ${ex.trust_score >= 8 ? 'tag-green' : ex.trust_score >= 5 ? 'tag-amber' : 'tag-red'}`}>
                                                    {ex.trust_score}/10
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                                                {ex.volume_24h_btc.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                                    {share.toFixed(1)}%
                                                    <div style={{ width: 40, height: 4, background: 'var(--bg-surface)', borderRadius: 2, overflow: 'hidden' }}>
                                                        <div style={{ width: `${share}%`, height: '100%', background: 'var(--amber)' }} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
