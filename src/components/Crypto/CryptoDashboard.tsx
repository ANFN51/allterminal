'use client';
import { useEffect, useState } from 'react';
import { MOCK_CRYPTO, CryptoAsset, formatCryptoPrice, generateWhaleAlerts } from '@/lib/coinGecko';
import { fmtBig } from '@/lib/marketData';

export default function CryptoDashboard() {
    const [coins, setCoins] = useState<CryptoAsset[]>(MOCK_CRYPTO);
    const [tab, setTab] = useState<'TABLE' | 'ON-CHAIN' | 'WHALES'>('TABLE');
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState<'market_cap_rank' | 'price_change_percentage_24h'>('market_cap_rank');

    useEffect(() => {
        setLoading(true);
        fetch('/api/crypto')
            .then(r => r.json())
            .then(data => { setCoins(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const featured = coins.slice(0, 3);
    const sorted = [...coins].sort((a, b) => sortBy === 'market_cap_rank'
        ? a.market_cap_rank - b.market_cap_rank
        : (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
    );
    const whales = generateWhaleAlerts();
    const defiCoins = coins.filter(c => c.tvl && c.tvl > 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Featured BTC / ETH / SOL */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8, padding: 10, flexShrink: 0,
                borderBottom: '1px solid var(--border)',
            }}>
                {featured.map(c => <FeaturedCard key={c.id} coin={c} />)}
            </div>

            {/* Tabs */}
            <div className="tab-bar" style={{ padding: '0 8px', flexShrink: 0 }}>
                {(['TABLE', 'ON-CHAIN', 'WHALES'] as const).map(t => (
                    <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
                ))}
                {tab === 'TABLE' && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>SORT:</span>
                        <button className={`btn ${sortBy === 'market_cap_rank' ? 'btn-amber' : 'btn-ghost'}`} style={{ fontSize: 9, padding: '2px 8px' }}
                            onClick={() => setSortBy('market_cap_rank')}>RANK</button>
                        <button className={`btn ${sortBy === 'price_change_percentage_24h' ? 'btn-amber' : 'btn-ghost'}`} style={{ fontSize: 9, padding: '2px 8px' }}
                            onClick={() => setSortBy('price_change_percentage_24h')}>24H CHG</button>
                    </div>
                )}
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
                {tab === 'TABLE' && (
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: 32 }}>#</th>
                                <th>NAME</th>
                                <th>CATEGORY</th>
                                <th style={{ textAlign: 'right' }}>PRICE</th>
                                <th style={{ textAlign: 'right' }}>24H %</th>
                                <th style={{ textAlign: 'right' }}>7D %</th>
                                <th style={{ textAlign: 'right' }}>MKT CAP</th>
                                <th style={{ textAlign: 'right' }}>VOLUME 24H</th>
                                <th style={{ textAlign: 'right' }}>ATH %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map(c => {
                                const chg24 = c.price_change_percentage_24h || 0;
                                const chg7d = c.price_change_percentage_7d_in_currency || 0;
                                const athChg = c.ath_change_percentage || 0;
                                return (
                                    <tr key={c.id}>
                                        <td style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{c.market_cap_rank}</td>
                                        <td>
                                            <span style={{ fontWeight: 700, color: 'var(--amber)', marginRight: 6, letterSpacing: '0.06em' }}>{c.symbol.toUpperCase()}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                                        </td>
                                        <td><span className={`tag ${getCategoryTag(c.category)}`}>{c.category}</span></td>
                                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCryptoPrice(c.current_price)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: chg24 >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                            {chg24 >= 0 ? '+' : ''}{chg24.toFixed(2)}%
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: chg7d >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                            {chg7d !== 0 ? `${chg7d >= 0 ? '+' : ''}${chg7d.toFixed(2)}%` : '—'}
                                        </td>
                                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                                            {fmtBig(c.market_cap)}
                                        </td>
                                        <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                                            {fmtBig(c.total_volume)}
                                        </td>
                                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--red)', fontSize: 11 }}>
                                            {athChg.toFixed(1)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {tab === 'ON-CHAIN' && (
                    <div style={{ padding: 12 }}>
                        <div style={{ marginBottom: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                            Protocol TVL, Revenue & Activity — Token Terminal style metrics
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>PROTOCOL</th>
                                    <th>CATEGORY</th>
                                    <th style={{ textAlign: 'right' }}>TVL</th>
                                    <th style={{ textAlign: 'right' }}>REV 30D</th>
                                    <th style={{ textAlign: 'right' }}>ACTIVE ADDR 24H</th>
                                    <th style={{ textAlign: 'right' }}>P/S RATIO</th>
                                    <th style={{ textAlign: 'right' }}>MKT CAP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {defiCoins.map(c => {
                                    const annualRevenue = (c.protocol_revenue_30d ?? 0) * 12;
                                    const ps = annualRevenue > 0 ? c.market_cap / annualRevenue : null;
                                    return (
                                        <tr key={c.id}>
                                            <td>
                                                <span style={{ fontWeight: 700, color: 'var(--amber)', marginRight: 6 }}>{c.symbol.toUpperCase()}</span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{c.name}</span>
                                            </td>
                                            <td><span className={`tag ${getCategoryTag(c.category)}`}>{c.category}</span></td>
                                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtBig(c.tvl ?? 0)}</td>
                                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--green)' }}>
                                                {c.protocol_revenue_30d ? fmtBig(c.protocol_revenue_30d) : '—'}
                                            </td>
                                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                                {c.active_addresses_24h ? (c.active_addresses_24h / 1000).toFixed(0) + 'K' : '—'}
                                            </td>
                                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--cyan)' }}>
                                                {ps ? `${ps.toFixed(1)}x` : '—'}
                                            </td>
                                            <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                                                {fmtBig(c.market_cap)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'WHALES' && (
                    <div style={{ padding: 12 }}>
                        <div style={{ marginBottom: 10, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: 13 }}>🐋 WHALE ALERT</span>
                            Tracking large on-chain transactions (&gt;$500K)
                        </div>
                        {whales.map(w => (
                            <div key={w.id} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '8px 12px', marginBottom: 4,
                                background: 'var(--bg-panel-alt)', border: '1px solid var(--border)', borderRadius: 4,
                                fontSize: 11,
                            }}>
                                <span style={{ color: 'var(--amber)', fontWeight: 700, minWidth: 36 }}>{w.coin}</span>
                                <span className={`tag ${w.type === 'Exchange Inflow' ? 'tag-red' : w.type === 'Exchange Outflow' ? 'tag-green' : 'tag-amber'}`}>
                                    {w.type}
                                </span>
                                <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: 80 }}>
                                    {w.amount.toLocaleString()} {w.coin}
                                </span>
                                <span style={{ color: 'var(--text-secondary)', minWidth: 90 }}>
                                    ≈ {fmtBig(w.valueUsd)}
                                </span>
                                <span style={{ color: 'var(--text-muted)', flex: 1, fontSize: 10 }}>
                                    {w.from} → {w.to}
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{w.txHash}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                                    {Math.floor((Date.now() - w.timestamp) / 60000)}m ago
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function FeaturedCard({ coin }: { coin: CryptoAsset }) {
    const chg = coin.price_change_percentage_24h || 0;
    return (
        <div style={{
            background: 'var(--bg-panel-alt)', border: '1px solid var(--border)', borderRadius: 4, padding: '12px 14px',
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: chg >= 0 ? 'var(--green)' : 'var(--red)', opacity: 0.7 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)' }}>{coin.symbol.toUpperCase()}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>{coin.name}</span>
                </div>
                <span className={`tag ${chg >= 0 ? 'tag-green' : 'tag-red'}`}>
                    {chg >= 0 ? '▲' : '▼'} {Math.abs(chg).toFixed(2)}%
                </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginBottom: 6 }}>
                ${formatCryptoPrice(coin.current_price)}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>MCap: <span style={{ color: 'var(--text-secondary)' }}>{fmtBig(coin.market_cap)}</span></span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Vol: <span style={{ color: 'var(--text-secondary)' }}>{fmtBig(coin.total_volume)}</span></span>
                {coin.tvl ? <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>TVL: <span style={{ color: 'var(--cyan)' }}>{fmtBig(coin.tvl)}</span></span> : null}
            </div>
        </div>
    );
}

function getCategoryTag(cat: string): string {
    const map: Record<string, string> = {
        'Layer 1': 'tag-amber', 'Layer 2': 'tag-blue', 'Layer 0': 'tag-purple',
        'DeFi': 'tag-cyan', 'AI Token': 'tag-purple', 'Stablecoin': 'tag-amber',
        'Meme': 'tag-red', 'GameFi': 'tag-green', 'Oracle': 'tag-cyan',
        'Exchange Token': 'tag-amber', 'Wrapped': 'tag-amber', 'Storage': 'tag-blue',
    };
    return map[cat] ?? 'tag-amber';
}
