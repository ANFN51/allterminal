'use client';
import { useEffect, useState } from 'react';
import { CryptoAsset, formatCryptoPrice } from '@/lib/coinGecko';
import { fmtBig } from '@/lib/marketData';

export default function CryptoDashboard() {
    const [coins, setCoins] = useState<CryptoAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'market_cap_rank' | 'price_change_percentage_24h'>('market_cap_rank');

    useEffect(() => {
        setLoading(true);
        fetch('/api/crypto')
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setCoins(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const featured = coins.slice(0, 3);
    const sorted = [...coins].sort((a, b) => sortBy === 'market_cap_rank'
        ? a.market_cap_rank - b.market_cap_rank
        : (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Featured Cards */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 8, padding: 10, flexShrink: 0,
                borderBottom: '1px solid var(--border)',
            }}>
                {featured.map(c => <FeaturedCard key={c.id} coin={c} />)}
                {loading && (
                    <div style={{ padding: 20, color: 'var(--text-muted)' }}>Loading live markets...</div>
                )}
            </div>

            {/* Main Table Controls */}
            <div className="tab-bar" style={{ padding: '0 8px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', margin: 'auto 12px', letterSpacing: '0.1em' }}>TOP 50 CRYPTO</span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>SORT:</span>
                    <button className={`btn ${sortBy === 'market_cap_rank' ? 'btn-amber' : 'btn-ghost'}`} style={{ fontSize: 9, padding: '2px 8px' }}
                        onClick={() => setSortBy('market_cap_rank')}>RANK</button>
                    <button className={`btn ${sortBy === 'price_change_percentage_24h' ? 'btn-amber' : 'btn-ghost'}`} style={{ fontSize: 9, padding: '2px 8px' }}
                        onClick={() => setSortBy('price_change_percentage_24h')}>24H CHG</button>
                </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
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
                                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${formatCryptoPrice(c.current_price)}</td>
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
                                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: athChg < 0 ? 'var(--red)' : 'var(--green)', fontSize: 11 }}>
                                        {athChg.toFixed(1)}%
                                    </td>
                                </tr>
                            );
                        })}
                        {sorted.length === 0 && !loading && (
                            <tr><td colSpan={9} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Could not load live crypto data. API rate limit exceeded.</td></tr>
                        )}
                    </tbody>
                </table>
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
