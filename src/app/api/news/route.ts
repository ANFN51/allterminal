import { NextResponse } from 'next/server';

export interface Article {
    id: string;
    title: string;
    publisher: string;
    link: string;
    publishedAt: string; // ISO string
    thumbnail?: string;
    summary?: string;
}

export async function GET() {
    try {
        // We use Yahoo Finance's undocumented search endpoint which returns news
        // Querying top market movers ensures we get a good flow of global financial news
        const res = await fetch('https://query2.finance.yahoo.com/v1/finance/search?q=AAPL,MSFT,TSLA,NVDA,SPY,BTC&newsCount=15', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Antigravity/2.0)',
                Accept: 'application/json',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!res.ok) {
            throw new Error(`Yahoo Finance API responded with status ${res.status}`);
        }

        const data = await res.json();
        const rawNews = data.news || [];

        const articles: Article[] = rawNews.map((item: any) => ({
            id: item.uuid,
            title: item.title,
            publisher: item.publisher,
            link: item.link,
            publishedAt: new Date(item.providerPublishTime * 1000).toISOString(),
            thumbnail: item.thumbnail?.resolutions?.[0]?.url || undefined,
            summary: item.type === 'STORY' ? 'Click to read full story on Yahoo Finance.' : undefined,
        }));

        // Filter out articles without titles or obvious junk
        const validArticles = articles.filter(a => a.title && a.link);

        return NextResponse.json(validArticles);
    } catch (e: any) {
        console.error('Failed to fetch news:', e.message);

        // Return a proper error response if the API drops
        return NextResponse.json(
            { error: 'Failed to fetch global news from Yahoo Finance.' },
            { status: 502 }
        );
    }
}
