// ============================================================
// GLOBAL STOCKS — International exchanges data
// Exchanges: LSE, TSE, HKEX, XETRA, Euronext, TSX, ASX, NSE, BOVESPA
// ============================================================

export interface GlobalQuote {
    ticker: string;
    name: string;
    currency: string;
    exchange: string;
    country: string;
    countryCode: string;      // ISO 2-letter
    flag: string;
    sector: string;
}

export const GLOBAL_STOCKS: Record<string, GlobalQuote> = {
    // ── LONDON STOCK EXCHANGE (LSE) ──────────────────────────────
    'SHEL.L': { ticker: 'SHEL.L', name: 'Shell PLC', currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Energy' },
    'HSBA.L': { ticker: 'HSBA.L', name: 'HSBC Holdings', currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Financials' },
    'AZN.L': { ticker: 'AZN.L', name: 'AstraZeneca PLC', currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Healthcare' },
    'BP.L': { ticker: 'BP.L', name: 'BP PLC', currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Energy' },
    'ULVR.L': { ticker: 'ULVR.L', name: 'Unilever PLC', currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Consumer' },
    'RIO.L': { ticker: 'RIO.L', name: 'Rio Tinto Group', currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Materials' },
    'GSK.L': { ticker: 'GSK.L', name: 'GSK PLC', currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Healthcare' },
    'LSEG.L': { ticker: 'LSEG.L', name: 'London Stock Exchange Group', currency: 'GBX', exchange: 'LSE', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', sector: 'Financials' },

    // ── TOKYO STOCK EXCHANGE ─────────────────────────────────────
    '7203.T': { ticker: '7203.T', name: 'Toyota Motor Corp.', currency: 'JPY', exchange: 'TSE', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', sector: 'Consumer' },
    '9984.T': { ticker: '9984.T', name: 'SoftBank Group', currency: 'JPY', exchange: 'TSE', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', sector: 'Technology' },
    '6758.T': { ticker: '6758.T', name: 'Sony Group Corp.', currency: 'JPY', exchange: 'TSE', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', sector: 'Technology' },
    '7267.T': { ticker: '7267.T', name: 'Honda Motor Co.', currency: 'JPY', exchange: 'TSE', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', sector: 'Consumer' },
    '6501.T': { ticker: '6501.T', name: 'Hitachi Ltd.', currency: 'JPY', exchange: 'TSE', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', sector: 'Industrials' },
    '8306.T': { ticker: '8306.T', name: 'Mitsubishi UFJ Financial', currency: 'JPY', exchange: 'TSE', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', sector: 'Financials' },

    // ── HONG KONG EXCHANGE (HKEX) ────────────────────────────────
    '0700.HK': { ticker: '0700.HK', name: 'Tencent Holdings', currency: 'HKD', exchange: 'HKEX', country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', sector: 'Technology' },
    '9988.HK': { ticker: '9988.HK', name: 'Alibaba Group', currency: 'HKD', exchange: 'HKEX', country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', sector: 'Technology' },
    '0005.HK': { ticker: '0005.HK', name: 'HSBC Holdings HK', currency: 'HKD', exchange: 'HKEX', country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', sector: 'Financials' },
    '1299.HK': { ticker: '1299.HK', name: 'AIA Group', currency: 'HKD', exchange: 'HKEX', country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', sector: 'Financials' },
    '2318.HK': { ticker: '2318.HK', name: 'Ping An Insurance', currency: 'HKD', exchange: 'HKEX', country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', sector: 'Financials' },
    '3690.HK': { ticker: '3690.HK', name: 'Meituan', currency: 'HKD', exchange: 'HKEX', country: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', sector: 'Technology' },

    // ── FRANKFURT (XETRA / DAX) ──────────────────────────────────
    'SAP.DE': { ticker: 'SAP.DE', name: 'SAP SE', currency: 'EUR', exchange: 'XETRA', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', sector: 'Technology' },
    'SIE.DE': { ticker: 'SIE.DE', name: 'Siemens AG', currency: 'EUR', exchange: 'XETRA', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', sector: 'Industrials' },
    'ALV.DE': { ticker: 'ALV.DE', name: 'Allianz SE', currency: 'EUR', exchange: 'XETRA', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', sector: 'Financials' },
    'BMW.DE': { ticker: 'BMW.DE', name: 'BMW AG', currency: 'EUR', exchange: 'XETRA', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', sector: 'Consumer' },
    'BAYN.DE': { ticker: 'BAYN.DE', name: 'Bayer AG', currency: 'EUR', exchange: 'XETRA', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', sector: 'Healthcare' },
    'DTE.DE': { ticker: 'DTE.DE', name: 'Deutsche Telekom', currency: 'EUR', exchange: 'XETRA', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', sector: 'Technology' },

    // ── EURONEXT (PARIS) ─────────────────────────────────────────
    'MC.PA': { ticker: 'MC.PA', name: 'LVMH Moët Hennessy', currency: 'EUR', exchange: 'Euronext Paris', country: 'France', countryCode: 'FR', flag: '🇫🇷', sector: 'Consumer' },
    'TTE.PA': { ticker: 'TTE.PA', name: 'TotalEnergies SE', currency: 'EUR', exchange: 'Euronext Paris', country: 'France', countryCode: 'FR', flag: '🇫🇷', sector: 'Energy' },
    'AIR.PA': { ticker: 'AIR.PA', name: 'Airbus SE', currency: 'EUR', exchange: 'Euronext Paris', country: 'France', countryCode: 'FR', flag: '🇫🇷', sector: 'Industrials' },
    'SAN.PA': { ticker: 'SAN.PA', name: 'Sanofi SA', currency: 'EUR', exchange: 'Euronext Paris', country: 'France', countryCode: 'FR', flag: '🇫🇷', sector: 'Healthcare' },
    'BNP.PA': { ticker: 'BNP.PA', name: 'BNP Paribas SA', currency: 'EUR', exchange: 'Euronext Paris', country: 'France', countryCode: 'FR', flag: '🇫🇷', sector: 'Financials' },

    // ── TORONTO STOCK EXCHANGE (TSX) ─────────────────────────────
    'RY.TO': { ticker: 'RY.TO', name: 'Royal Bank of Canada', currency: 'CAD', exchange: 'TSX', country: 'Canada', countryCode: 'CA', flag: '🇨🇦', sector: 'Financials' },
    'TD.TO': { ticker: 'TD.TO', name: 'TD Bank Group', currency: 'CAD', exchange: 'TSX', country: 'Canada', countryCode: 'CA', flag: '🇨🇦', sector: 'Financials' },
    'CNR.TO': { ticker: 'CNR.TO', name: 'Canadian National Railway', currency: 'CAD', exchange: 'TSX', country: 'Canada', countryCode: 'CA', flag: '🇨🇦', sector: 'Industrials' },
    'SHOP.TO': { ticker: 'SHOP.TO', name: 'Shopify Inc.', currency: 'CAD', exchange: 'TSX', country: 'Canada', countryCode: 'CA', flag: '🇨🇦', sector: 'Technology' },
    'BCE.TO': { ticker: 'BCE.TO', name: 'BCE Inc.', currency: 'CAD', exchange: 'TSX', country: 'Canada', countryCode: 'CA', flag: '🇨🇦', sector: 'Technology' },

    // ── AUSTRALIAN SECURITIES EXCHANGE (ASX) ─────────────────────
    'BHP.AX': { ticker: 'BHP.AX', name: 'BHP Group Ltd.', currency: 'AUD', exchange: 'ASX', country: 'Australia', countryCode: 'AU', flag: '🇦🇺', sector: 'Materials' },
    'CBA.AX': { ticker: 'CBA.AX', name: 'Commonwealth Bank AU', currency: 'AUD', exchange: 'ASX', country: 'Australia', countryCode: 'AU', flag: '🇦🇺', sector: 'Financials' },
    'CSL.AX': { ticker: 'CSL.AX', name: 'CSL Ltd.', currency: 'AUD', exchange: 'ASX', country: 'Australia', countryCode: 'AU', flag: '🇦🇺', sector: 'Healthcare' },
    'WBC.AX': { ticker: 'WBC.AX', name: 'Westpac Banking Corp.', currency: 'AUD', exchange: 'ASX', country: 'Australia', countryCode: 'AU', flag: '🇦🇺', sector: 'Financials' },
    'RIO.AX': { ticker: 'RIO.AX', name: 'Rio Tinto Ltd.', currency: 'AUD', exchange: 'ASX', country: 'Australia', countryCode: 'AU', flag: '🇦🇺', sector: 'Materials' },

    // ── NATIONAL STOCK EXCHANGE (NSE India) ──────────────────────
    'RELIANCE.NS': { ticker: 'RELIANCE.NS', name: 'Reliance Industries', currency: 'INR', exchange: 'NSE', country: 'India', countryCode: 'IN', flag: '🇮🇳', sector: 'Energy' },
    'TCS.NS': { ticker: 'TCS.NS', name: 'Tata Consultancy Services', currency: 'INR', exchange: 'NSE', country: 'India', countryCode: 'IN', flag: '🇮🇳', sector: 'Technology' },
    'INFY.NS': { ticker: 'INFY.NS', name: 'Infosys Ltd.', currency: 'INR', exchange: 'NSE', country: 'India', countryCode: 'IN', flag: '🇮🇳', sector: 'Technology' },
    'HDFCBANK.NS': { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', currency: 'INR', exchange: 'NSE', country: 'India', countryCode: 'IN', flag: '🇮🇳', sector: 'Financials' },
    'WIPRO.NS': { ticker: 'WIPRO.NS', name: 'Wipro Ltd.', currency: 'INR', exchange: 'NSE', country: 'India', countryCode: 'IN', flag: '🇮🇳', sector: 'Technology' },

    // ── SWISS EXCHANGE (SIX) ─────────────────────────────────────
    'NESN.SW': { ticker: 'NESN.SW', name: 'Nestlé SA', currency: 'CHF', exchange: 'SIX', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', sector: 'Consumer' },
    'NOVN.SW': { ticker: 'NOVN.SW', name: 'Novartis AG', currency: 'CHF', exchange: 'SIX', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', sector: 'Healthcare' },
    'ROG.SW': { ticker: 'ROG.SW', name: 'Roche Holding AG', currency: 'CHF', exchange: 'SIX', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', sector: 'Healthcare' },

    // ── NASDAQ NORDIC / STOCKHOLM ────────────────────────────────
    'ERIC-B.ST': { ticker: 'ERIC-B.ST', name: 'Ericsson AB', currency: 'SEK', exchange: 'Nasdaq Nordic', country: 'Sweden', countryCode: 'SE', flag: '🇸🇪', sector: 'Technology' },
    'VOLV-B.ST': { ticker: 'VOLV-B.ST', name: 'Volvo AB', currency: 'SEK', exchange: 'Nasdaq Nordic', country: 'Sweden', countryCode: 'SE', flag: '🇸🇪', sector: 'Industrials' },

    // ── BRASIL BOLSA BALCÃO (B3) ────────────────────────────────
    'VALE3.SA': { ticker: 'VALE3.SA', name: 'Vale SA', currency: 'BRL', exchange: 'B3', country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', sector: 'Materials' },
    'PETR4.SA': { ticker: 'PETR4.SA', name: 'Petrobras PN', currency: 'BRL', exchange: 'B3', country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', sector: 'Energy' },
    'ITUB4.SA': { ticker: 'ITUB4.SA', name: 'Itaú Unibanco PN', currency: 'BRL', exchange: 'B3', country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', sector: 'Financials' },

    // ── KOREA EXCHANGE (KRX) ────────────────────────────────────
    '005930.KS': { ticker: '005930.KS', name: 'Samsung Electronics', currency: 'KRW', exchange: 'KRX', country: 'South Korea', countryCode: 'KR', flag: '🇰🇷', sector: 'Technology' },
    '000660.KS': { ticker: '000660.KS', name: 'SK Hynix Inc.', currency: 'KRW', exchange: 'KRX', country: 'South Korea', countryCode: 'KR', flag: '🇰🇷', sector: 'Technology' },

    // ── AMSTERDAM (EURONEXT) ────────────────────────────────────
    'ASML.AS': { ticker: 'ASML.AS', name: 'ASML Holding NV', currency: 'EUR', exchange: 'Euronext Amsterdam', country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', sector: 'Technology' },
    'INGA.AS': { ticker: 'INGA.AS', name: 'ING Groep NV', currency: 'EUR', exchange: 'Euronext Amsterdam', country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', sector: 'Financials' },
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

