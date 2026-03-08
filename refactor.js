const fs = require('fs');

let su = fs.readFileSync('src/lib/stockUniverse.ts', 'utf8');

// Update type definitions
su = su.replace(/type CompactStock = \[string, string, string, number, number, number\];/g, 'type CompactStock = [string, string, string];');
su = su.replace(/type CompactStock5 = \[string, string, string, number, number\];/g, '');
su = su.replace(/export const GLOBAL_COMPACT: CompactStock5\[\]/g, 'export const GLOBAL_COMPACT: CompactStock[]');

// Update SP500_COMPACT arrays: ['AAPL', 'Apple Inc.', 'Technology', 189.30, 2940, 31.2] -> ['AAPL', 'Apple Inc.', 'Technology']
su = su.replace(/(\['[^']+',\s*'[^']+',\s*'[^']+')\s*,\s*[^,\]]+\s*,\s*[^,\]]+\s*,\s*[^,\]]+\s*\]/g, '$1]');

// Update GLOBAL_COMPACT arrays: ['SHEL.L', 'Shell PLC', 'Energy', 2812.5, 220] -> ['SHEL.L', 'Shell PLC', 'Energy']
su = su.replace(/(\['[^']+',\s*'[^']+',\s*'[^']+')\s*,\s*[^,\]]+\s*,\s*[^,\]]+\s*\]/g, '$1]');

fs.writeFileSync('src/lib/stockUniverse.ts', su);


let gs = fs.readFileSync('src/lib/globalStocks.ts', 'utf8');

// Update Interface
gs = gs.replace(/\s*price: number;/g, '');
gs = gs.replace(/\s*changePct: number;/g, '');
gs = gs.replace(/\s*change: number;/g, '');
gs = gs.replace(/\s*marketCap: number;.*$/gm, '');
gs = gs.replace(/\s*pe: number \| null;/g, '');
gs = gs.replace(/\s*dividend: number;.*$/gm, '');
gs = gs.replace(/\s*week52High: number;/g, '');
gs = gs.replace(/\s*week52Low: number;/g, '');

// Update GLOBAL_STOCKS objects
gs = gs.replace(/price:\s*[^,]+,\s*changePct:\s*[^,]+,\s*change:\s*[^,]+,\s*marketCap:\s*[^,]+,\s/g, '');
gs = gs.replace(/,\s*pe:\s*[^,]+,\s*dividend:\s*[^,]+,\s*week52High:\s*[^,]+,\s*week52Low:\s*[^}]+\s*}/g, ' }');

fs.writeFileSync('src/lib/globalStocks.ts', gs);
console.log('Stock models refactored.');
