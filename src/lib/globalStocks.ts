// ============================================================
// GLOBAL STOCKS — International exchanges data
// Exchanges: LSE, TSE, HKEX, XETRA, Euronext, TSX, ASX, NSE, BOVESPA
// ============================================================

export interface GlobalQuote {
    ticker: string;
    name: string;
    price: number;
    changePct: number;
    change: number;
    marketCap: number;        // USD equivalent
    currency: string;
    exchange: string;
    country: string;
    countryCode: string;      // ISO 2-letter
    flag: string;
    sector: string;
    pe: number | null;
    dividend: number;         // yield %
    week52High: number;
    week52Low: number;
}

export const GLOBAL_STOCKS: Record<string, GlobalQuote> = {
    // ── LONDON STOCK EXCHANGE (LSE) ──────────────────────────────
    'SHEL.L': { ticker: 'SHEL.L', name: 'Shell PLC', price: 2812.50, changePct: 0.84, change: 23.40, marketCap: 220_400_000_000, currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Energy', pe: 12.4, dividend: 3.8, week52High: 2942.0, week52Low: 2350.0 },
    'HSBA.L': { ticker: 'HSBA.L', name: 'HSBC Holdings', price: 698.20, changePct: 1.12, change: 7.70, marketCap: 151_200_000_000, currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Financials', pe: 9.2, dividend: 6.4, week52High: 748.9, week52Low: 575.2 },
    'AZN.L': { ticker: 'AZN.L', name: 'AstraZeneca PLC', price: 11240.0, changePct: -0.42, change: -47.50, marketCap: 219_800_000_000, currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Healthcare', pe: 35.8, dividend: 2.1, week52High: 12840.0, week52Low: 10100.0 },
    'BP.L': { ticker: 'BP.L', name: 'BP PLC', price: 432.85, changePct: -0.61, change: -2.65, marketCap: 89_200_000_000, currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Energy', pe: 10.1, dividend: 5.2, week52High: 524.2, week52Low: 408.1 },
    'ULVR.L': { ticker: 'ULVR.L', name: 'Unilever PLC', price: 4298.0, changePct: 0.31, change: 13.20, marketCap: 114_600_000_000, currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Consumer', pe: 21.4, dividend: 3.7, week52High: 4592.0, week52Low: 3728.0 },
    'RIO.L': { ticker: 'RIO.L', name: 'Rio Tinto Group', price: 4912.0, changePct: 1.24, change: 60.20, marketCap: 79_400_000_000, currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Materials', pe: 11.2, dividend: 7.8, week52High: 6218.0, week52Low: 4580.0 },
    'GSK.L': { ticker: 'GSK.L', name: 'GSK PLC', price: 1754.8, changePct: 0.48, change: 8.40, marketCap: 72_100_000_000, currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Healthcare', pe: 14.8, dividend: 3.9, week52High: 1882.0, week52Low: 1420.0 },
    'LSEG.L': { ticker: 'LSEG.L', name: 'London Stock Exchange Group', price: 10140.0, changePct: 0.22, change: 22.0, marketCap: 58_200_000_000, currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Financials', pe: 42.1, dividend: 1.1, week52High: 11280.0, week52Low: 8920.0 },

    // ── TOKYO STOCK EXCHANGE ─────────────────────────────────────
    '7203.T': { ticker: '7203.T', name: 'Toyota Motor Corp.', price: 3142.0, changePct: 0.64, change: 20.0, marketCap: 218_400_000_000, currency: 'JPY', exchange: 'TSE', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', sector: 'Consumer', pe: 9.8, dividend: 2.4, week52High: 3890.0, week52Low: 2480.0 },
    '9984.T': { ticker: '9984.T', name: 'SoftBank Group', price: 9142.0, changePct: 2.18, change: 195.0, marketCap: 146_800_000_000, currency: 'JPY', exchange: 'TSE', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', sector: 'Technology', pe: null, dividend: 0.5, week52High: 12420.0, week52Low: 6280.0 },
    '6758.T': { ticker: '6758.T', name: 'Sony Group Corp.', price: 2948.0, changePct: -0.37, change: -11.0, marketCap: 109_200_000_000, currency: 'JPY', exchange: 'TSE', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', sector: 'Technology', pe: 18.4, dividend: 0.6, week52High: 3948.0, week52Low: 2180.0 },
    '7267.T': { ticker: '7267.T', name: 'Honda Motor Co.', price: 1548.0, changePct: 0.39, change: 6.0, marketCap: 71_200_000_000, currency: 'JPY', exchange: 'TSE', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', sector: 'Consumer', pe: 7.8, dividend: 3.4, week52High: 2042.0, week52Low: 1380.0 },
    '6501.T': { ticker: '6501.T', name: 'Hitachi Ltd.', price: 3892.0, changePct: 1.02, change: 39.0, marketCap: 83_400_000_000, currency: 'JPY', exchange: 'TSE', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', sector: 'Industrials', pe: 22.4, dividend: 1.2, week52High: 4820.0, week52Low: 2940.0 },
    '8306.T': { ticker: '8306.T', name: 'Mitsubishi UFJ Financial', price: 1824.0, changePct: 0.77, change: 14.0, marketCap: 148_400_000_000, currency: 'JPY', exchange: 'TSE', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', sector: 'Financials', pe: 10.2, dividend: 2.8, week52High: 1948.0, week52Low: 1048.0 },

    // ── HONG KONG EXCHANGE (HKEX) ────────────────────────────────
    '0700.HK': { ticker: '0700.HK', name: 'Tencent Holdings', price: 378.40, changePct: 1.44, change: 5.40, marketCap: 362_400_000_000, currency: 'HKD', exchange: 'HKEX', country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', sector: 'Technology', pe: 24.2, dividend: 1.6, week52High: 408.0, week52Low: 248.0 },
    '9988.HK': { ticker: '9988.HK', name: 'Alibaba Group', price: 84.15, changePct: -0.82, change: -0.70, marketCap: 204_800_000_000, currency: 'HKD', exchange: 'HKEX', country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', sector: 'Technology', pe: 14.8, dividend: 0, week52High: 109.4, week52Low: 62.8 },
    '0005.HK': { ticker: '0005.HK', name: 'HSBC Holdings HK', price: 87.15, changePct: 0.81, change: 0.70, marketCap: 151_200_000_000, currency: 'HKD', exchange: 'HKEX', country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', sector: 'Financials', pe: 9.2, dividend: 6.4, week52High: 94.2, week52Low: 56.4 },
    '1299.HK': { ticker: '1299.HK', name: 'AIA Group', price: 52.85, changePct: 0.38, change: 0.20, marketCap: 72_400_000_000, currency: 'HKD', exchange: 'HKEX', country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', sector: 'Financials', pe: 16.4, dividend: 2.8, week52High: 74.2, week52Low: 46.8 },
    '2318.HK': { ticker: '2318.HK', name: 'Ping An Insurance', price: 42.35, changePct: -0.47, change: -0.20, marketCap: 78_200_000_000, currency: 'HKD', exchange: 'HKEX', country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', sector: 'Financials', pe: 8.8, dividend: 5.2, week52High: 58.4, week52Low: 38.2 },
    '3690.HK': { ticker: '3690.HK', name: 'Meituan', price: 148.20, changePct: 2.14, change: 3.10, marketCap: 94_800_000_000, currency: 'HKD', exchange: 'HKEX', country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', sector: 'Technology', pe: null, dividend: 0, week52High: 198.4, week52Low: 98.2 },

    // ── FRANKFURT (XETRA / DAX) ──────────────────────────────────
    'SAP.DE': { ticker: 'SAP.DE', name: 'SAP SE', price: 188.42, changePct: 0.94, change: 1.75, marketCap: 232_400_000_000, currency: 'EUR', exchange: 'XETRA', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', sector: 'Technology', pe: 42.8, dividend: 1.4, week52High: 214.8, week52Low: 142.2 },
    'SIE.DE': { ticker: 'SIE.DE', name: 'Siemens AG', price: 178.28, changePct: 0.34, change: 0.60, marketCap: 141_200_000_000, currency: 'EUR', exchange: 'XETRA', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', sector: 'Industrials', pe: 19.2, dividend: 2.6, week52High: 198.4, week52Low: 134.8 },
    'ALV.DE': { ticker: 'ALV.DE', name: 'Allianz SE', price: 282.40, changePct: 0.57, change: 1.60, marketCap: 122_800_000_000, currency: 'EUR', exchange: 'XETRA', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', sector: 'Financials', pe: 12.8, dividend: 4.2, week52High: 298.0, week52Low: 218.4 },
    'BMW.DE': { ticker: 'BMW.DE', name: 'BMW AG', price: 98.84, changePct: -0.48, change: -0.48, marketCap: 62_400_000_000, currency: 'EUR', exchange: 'XETRA', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', sector: 'Consumer', pe: 6.4, dividend: 7.8, week52High: 118.4, week52Low: 82.4 },
    'BAYN.DE': { ticker: 'BAYN.DE', name: 'Bayer AG', price: 28.42, changePct: -1.24, change: -0.36, marketCap: 28_400_000_000, currency: 'EUR', exchange: 'XETRA', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', sector: 'Healthcare', pe: null, dividend: 1.2, week52High: 58.4, week52Low: 24.8 },
    'DTE.DE': { ticker: 'DTE.DE', name: 'Deutsche Telekom', price: 24.82, changePct: 0.28, change: 0.07, marketCap: 118_200_000_000, currency: 'EUR', exchange: 'XETRA', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', sector: 'Technology', pe: 14.2, dividend: 3.8, week52High: 28.4, week52Low: 20.2 },

    // ── EURONEXT (PARIS) ─────────────────────────────────────────
    'MC.PA': { ticker: 'MC.PA', name: 'LVMH Moët Hennessy', price: 724.40, changePct: -0.62, change: -4.50, marketCap: 358_400_000_000, currency: 'EUR', exchange: 'Euronext Paris', country: 'France', countryCode: 'FR', flag: '🇫🇷', sector: 'Consumer', pe: 22.4, dividend: 2.6, week52High: 948.0, week52Low: 618.0 },
    'TTE.PA': { ticker: 'TTE.PA', name: 'TotalEnergies SE', price: 64.42, changePct: 0.72, change: 0.46, marketCap: 148_200_000_000, currency: 'EUR', exchange: 'Euronext Paris', country: 'France', countryCode: 'FR', flag: '🇫🇷', sector: 'Energy', pe: 9.8, dividend: 4.8, week52High: 72.8, week52Low: 56.2 },
    'AIR.PA': { ticker: 'AIR.PA', name: 'Airbus SE', price: 162.84, changePct: 1.14, change: 1.84, marketCap: 128_400_000_000, currency: 'EUR', exchange: 'Euronext Paris', country: 'France', countryCode: 'FR', flag: '🇫🇷', sector: 'Industrials', pe: 32.4, dividend: 1.4, week52High: 182.4, week52Low: 128.0 },
    'SAN.PA': { ticker: 'SAN.PA', name: 'Sanofi SA', price: 98.14, changePct: 0.22, change: 0.22, marketCap: 124_800_000_000, currency: 'EUR', exchange: 'Euronext Paris', country: 'France', countryCode: 'FR', flag: '🇫🇷', sector: 'Healthcare', pe: 14.8, dividend: 4.2, week52High: 112.4, week52Low: 84.2 },
    'BNP.PA': { ticker: 'BNP.PA', name: 'BNP Paribas SA', price: 62.82, changePct: 0.48, change: 0.30, marketCap: 72_400_000_000, currency: 'EUR', exchange: 'Euronext Paris', country: 'France', countryCode: 'FR', flag: '🇫🇷', sector: 'Financials', pe: 7.8, dividend: 5.8, week52High: 74.8, week52Low: 54.2 },

    // ── TORONTO STOCK EXCHANGE (TSX) ─────────────────────────────
    'RY.TO': { ticker: 'RY.TO', name: 'Royal Bank of Canada', price: 148.42, changePct: 0.44, change: 0.65, marketCap: 218_400_000_000, currency: 'CAD', exchange: 'TSX', country: 'Canada', countryCode: 'CA', flag: '🇨🇦', sector: 'Financials', pe: 14.2, dividend: 3.6, week52High: 158.4, week52Low: 124.8 },
    'TD.TO': { ticker: 'TD.TO', name: 'TD Bank Group', price: 84.14, changePct: 0.17, change: 0.14, marketCap: 148_200_000_000, currency: 'CAD', exchange: 'TSX', country: 'Canada', countryCode: 'CA', flag: '🇨🇦', sector: 'Financials', pe: 10.8, dividend: 4.8, week52High: 94.2, week52Low: 74.8 },
    'CNR.TO': { ticker: 'CNR.TO', name: 'Canadian National Railway', price: 172.84, changePct: 0.38, change: 0.65, marketCap: 112_400_000_000, currency: 'CAD', exchange: 'TSX', country: 'Canada', countryCode: 'CA', flag: '🇨🇦', sector: 'Industrials', pe: 22.4, dividend: 2.2, week52High: 184.2, week52Low: 148.4 },
    'SHOP.TO': { ticker: 'SHOP.TO', name: 'Shopify Inc.', price: 118.42, changePct: 2.14, change: 2.48, marketCap: 152_400_000_000, currency: 'CAD', exchange: 'TSX', country: 'Canada', countryCode: 'CA', flag: '🇨🇦', sector: 'Technology', pe: null, dividend: 0, week52High: 142.8, week52Low: 78.4 },
    'BCE.TO': { ticker: 'BCE.TO', name: 'BCE Inc.', price: 42.84, changePct: -0.28, change: -0.12, marketCap: 38_400_000_000, currency: 'CAD', exchange: 'TSX', country: 'Canada', countryCode: 'CA', flag: '🇨🇦', sector: 'Technology', pe: 18.4, dividend: 9.2, week52High: 56.8, week52Low: 38.2 },

    // ── AUSTRALIAN SECURITIES EXCHANGE (ASX) ─────────────────────
    'BHP.AX': { ticker: 'BHP.AX', name: 'BHP Group Ltd.', price: 42.84, changePct: 1.24, change: 0.52, marketCap: 218_400_000_000, currency: 'AUD', exchange: 'ASX', country: 'Australia', countryCode: 'AU', flag: '🇦🇺', sector: 'Materials', pe: 12.4, dividend: 6.8, week52High: 48.2, week52Low: 36.4 },
    'CBA.AX': { ticker: 'CBA.AX', name: 'Commonwealth Bank AU', price: 148.42, changePct: 0.44, change: 0.65, marketCap: 248_400_000_000, currency: 'AUD', exchange: 'ASX', country: 'Australia', countryCode: 'AU', flag: '🇦🇺', sector: 'Financials', pe: 24.8, dividend: 3.2, week52High: 158.4, week52Low: 102.8 },
    'CSL.AX': { ticker: 'CSL.AX', name: 'CSL Ltd.', price: 298.42, changePct: 0.84, change: 2.48, marketCap: 138_400_000_000, currency: 'AUD', exchange: 'ASX', country: 'Australia', countryCode: 'AU', flag: '🇦🇺', sector: 'Healthcare', pe: 38.4, dividend: 1.2, week52High: 328.4, week52Low: 242.4 },
    'WBC.AX': { ticker: 'WBC.AX', name: 'Westpac Banking Corp.', price: 28.84, changePct: 0.21, change: 0.06, marketCap: 98_400_000_000, currency: 'AUD', exchange: 'ASX', country: 'Australia', countryCode: 'AU', flag: '🇦🇺', sector: 'Financials', pe: 18.4, dividend: 5.4, week52High: 32.4, week52Low: 22.4 },
    'RIO.AX': { ticker: 'RIO.AX', name: 'Rio Tinto Ltd.', price: 124.42, changePct: 1.14, change: 1.40, marketCap: 82_400_000_000, currency: 'AUD', exchange: 'ASX', country: 'Australia', countryCode: 'AU', flag: '🇦🇺', sector: 'Materials', pe: 11.2, dividend: 7.8, week52High: 148.4, week52Low: 108.4 },

    // ── NATIONAL STOCK EXCHANGE (NSE India) ──────────────────────
    'RELIANCE.NS': { ticker: 'RELIANCE.NS', name: 'Reliance Industries', price: 2842.0, changePct: 0.94, change: 26.4, marketCap: 242_400_000_000, currency: 'INR', exchange: 'NSE', country: 'India', countryCode: 'IN', flag: '🇮🇳', sector: 'Energy', pe: 28.4, dividend: 0.6, week52High: 3024.0, week52Low: 2220.0 },
    'TCS.NS': { ticker: 'TCS.NS', name: 'Tata Consultancy Services', price: 4142.0, changePct: 0.44, change: 18.2, marketCap: 152_400_000_000, currency: 'INR', exchange: 'NSE', country: 'India', countryCode: 'IN', flag: '🇮🇳', sector: 'Technology', pe: 32.4, dividend: 2.4, week52High: 4424.0, week52Low: 3284.0 },
    'INFY.NS': { ticker: 'INFY.NS', name: 'Infosys Ltd.', price: 1842.0, changePct: -0.24, change: -4.4, marketCap: 78_200_000_000, currency: 'INR', exchange: 'NSE', country: 'India', countryCode: 'IN', flag: '🇮🇳', sector: 'Technology', pe: 24.8, dividend: 2.8, week52High: 1998.0, week52Low: 1324.0 },
    'HDFCBANK.NS': { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', price: 1684.0, changePct: 0.62, change: 10.4, marketCap: 128_400_000_000, currency: 'INR', exchange: 'NSE', country: 'India', countryCode: 'IN', flag: '🇮🇳', sector: 'Financials', pe: 18.4, dividend: 1.2, week52High: 1798.0, week52Low: 1364.0 },
    'WIPRO.NS': { ticker: 'WIPRO.NS', name: 'Wipro Ltd.', price: 514.0, changePct: 0.19, change: 1.0, marketCap: 54_200_000_000, currency: 'INR', exchange: 'NSE', country: 'India', countryCode: 'IN', flag: '🇮🇳', sector: 'Technology', pe: 22.4, dividend: 1.6, week52High: 598.0, week52Low: 424.0 },

    // ── SWISS EXCHANGE (SIX) ─────────────────────────────────────
    'NESN.SW': { ticker: 'NESN.SW', name: 'Nestlé SA', price: 87.82, changePct: -0.48, change: -0.43, marketCap: 248_400_000_000, currency: 'CHF', exchange: 'SIX', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', sector: 'Consumer', pe: 24.4, dividend: 3.2, week52High: 98.4, week52Low: 82.4 },
    'NOVN.SW': { ticker: 'NOVN.SW', name: 'Novartis AG', price: 98.14, changePct: 0.24, change: 0.23, marketCap: 218_400_000_000, currency: 'CHF', exchange: 'SIX', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', sector: 'Healthcare', pe: 22.4, dividend: 3.8, week52High: 108.4, week52Low: 84.8 },
    'ROG.SW': { ticker: 'ROG.SW', name: 'Roche Holding AG', price: 248.30, changePct: 0.12, change: 0.30, marketCap: 224_400_000_000, currency: 'CHF', exchange: 'SIX', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', sector: 'Healthcare', pe: 18.8, dividend: 3.4, week52High: 284.0, week52Low: 228.0 },

    // ── NASDAQ NORDIC / STOCKHOLM ────────────────────────────────
    'ERIC-B.ST': { ticker: 'ERIC-B.ST', name: 'Ericsson AB', price: 72.42, changePct: 0.84, change: 0.60, marketCap: 24_200_000_000, currency: 'SEK', exchange: 'Nasdaq Nordic', country: 'Sweden', countryCode: 'SE', flag: '🇸🇪', sector: 'Technology', pe: 14.8, dividend: 3.2, week52High: 84.2, week52Low: 56.4 },
    'VOLV-B.ST': { ticker: 'VOLV-B.ST', name: 'Volvo AB', price: 248.40, changePct: 0.44, change: 1.08, marketCap: 52_400_000_000, currency: 'SEK', exchange: 'Nasdaq Nordic', country: 'Sweden', countryCode: 'SE', flag: '🇸🇪', sector: 'Industrials', pe: 12.4, dividend: 5.4, week52High: 282.8, week52Low: 218.4 },

    // ── BRASIL BOLSA BALCÃO (B3) ────────────────────────────────
    'VALE3.SA': { ticker: 'VALE3.SA', name: 'Vale SA', price: 62.84, changePct: 1.24, change: 0.77, marketCap: 62_400_000_000, currency: 'BRL', exchange: 'B3', country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', sector: 'Materials', pe: 8.2, dividend: 9.4, week52High: 78.4, week52Low: 52.8 },
    'PETR4.SA': { ticker: 'PETR4.SA', name: 'Petrobras PN', price: 38.14, changePct: 0.71, change: 0.27, marketCap: 98_400_000_000, currency: 'BRL', exchange: 'B3', country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', sector: 'Energy', pe: 7.4, dividend: 12.8, week52High: 48.2, week52Low: 32.4 },
    'ITUB4.SA': { ticker: 'ITUB4.SA', name: 'Itaú Unibanco PN', price: 34.82, changePct: 0.38, change: 0.13, marketCap: 108_400_000_000, currency: 'BRL', exchange: 'B3', country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', sector: 'Financials', pe: 10.8, dividend: 6.8, week52High: 38.4, week52Low: 28.2 },

    // ── KOREA EXCHANGE (KRX) ────────────────────────────────────
    '005930.KS': { ticker: '005930.KS', name: 'Samsung Electronics', price: 73400, changePct: 0.82, change: 600, marketCap: 438_400_000_000, currency: 'KRW', exchange: 'KRX', country: 'South Korea', countryCode: 'KR', flag: '🇰🇷', sector: 'Technology', pe: 14.2, dividend: 2.4, week52High: 88400, week52Low: 62400 },
    '000660.KS': { ticker: '000660.KS', name: 'SK Hynix Inc.', price: 184200, changePct: 1.44, change: 2600, marketCap: 134_200_000_000, currency: 'KRW', exchange: 'KRX', country: 'South Korea', countryCode: 'KR', flag: '🇰🇷', sector: 'Technology', pe: 8.4, dividend: 0.8, week52High: 198000, week52Low: 122000 },

    // ── AMSTERDAM (EURONEXT) ────────────────────────────────────
    'ASML.AS': { ticker: 'ASML.AS', name: 'ASML Holding NV', price: 742.40, changePct: 1.24, change: 9.10, marketCap: 298_400_000_000, currency: 'EUR', exchange: 'Euronext Amsterdam', country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', sector: 'Technology', pe: 38.4, dividend: 1.6, week52High: 1012.4, week52Low: 614.8 },
    'INGA.AS': { ticker: 'INGA.AS', name: 'ING Groep NV', price: 14.84, changePct: 0.54, change: 0.08, marketCap: 58_400_000_000, currency: 'EUR', exchange: 'Euronext Amsterdam', country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', sector: 'Financials', pe: 8.4, dividend: 6.4, week52High: 16.8, week52Low: 12.2 },
};

export const EXCHANGES = [
    { code: 'NYSE', name: 'New York Stock Exchange', country: 'US', flag: '🇺🇸', timezone: 'EST', hours: '9:30–16:00', stocks: 2400 },
    { code: 'NASDAQ', name: 'NASDAQ', country: 'US', flag: '🇺🇸', timezone: 'EST', hours: '9:30–16:00', stocks: 3300 },
    { code: 'LSE', name: 'London Stock Exchange', country: 'GB', flag: '🇬🇧', timezone: 'GMT', hours: '8:00–16:30', stocks: 1900 },
    { code: 'TSE', name: 'Tokyo Stock Exchange', country: 'JP', flag: '🇯🇵', timezone: 'JST', hours: '9:00–15:30', stocks: 3800 },
    { code: 'HKEX', name: 'Hong Kong Exchange', country: 'HK', flag: '🇭🇰', timezone: 'HKT', hours: '9:30–16:00', stocks: 2500 },
    { code: 'XETRA', name: 'Deutsche Börse (XETRA)', country: 'DE', flag: '🇩🇪', timezone: 'CET', hours: '9:00–17:30', stocks: 1200 },
    { code: 'Euronext', name: 'Euronext Paris', country: 'FR', flag: '🇫🇷', timezone: 'CET', hours: '9:00–17:30', stocks: 1500 },
    { code: 'TSX', name: 'Toronto Stock Exchange', country: 'CA', flag: '🇨🇦', timezone: 'EST', hours: '9:30–16:00', stocks: 1600 },
    { code: 'ASX', name: 'Australian Securities Exch.', country: 'AU', flag: '🇦🇺', timezone: 'AEST', hours: '10:00–16:00', stocks: 2200 },
    { code: 'NSE', name: 'NSE India', country: 'IN', flag: '🇮🇳', timezone: 'IST', hours: '9:15–15:30', stocks: 2000 },
    { code: 'SIX', name: 'Swiss Exchange', country: 'CH', flag: '🇨🇭', timezone: 'CET', hours: '9:00–17:30', stocks: 250 },
    { code: 'KRX', name: 'Korea Exchange', country: 'KR', flag: '🇰🇷', timezone: 'KST', hours: '9:00–15:30', stocks: 2400 },
    { code: 'B3', name: 'Brasil Bolsa Balcão', country: 'BR', flag: '🇧🇷', timezone: 'BRT', hours: '10:00–17:00', stocks: 400 },
];

