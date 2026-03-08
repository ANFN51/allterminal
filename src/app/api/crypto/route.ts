import { NextRequest, NextResponse } from 'next/server';
import { fetchCryptoMarket } from '@/lib/coinGecko';

export async function GET(_req: NextRequest) {
    const data = await fetchCryptoMarket();
    return NextResponse.json(data);
}
