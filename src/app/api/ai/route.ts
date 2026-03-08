import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { query, context } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a senior financial analyst AI for the Allterminals terminal. 
              Analyze market conditions, provide concise assessments, and structure your response as JSON with these exact fields:
              summary (string), sentiment_score (number -100 to 100), key_risks (string[]), 
              catalysts (string[]), price_target (string), bull_factors (string[]), bear_factors (string[]),
              technical_outlook (string), recommendation (BUY/SELL/HOLD/NEUTRAL).
              Be concise, professional, and data-driven.`,
                        },
                        { role: 'user', content: `${query}\nContext: ${JSON.stringify(context)}` },
                    ],
                    response_format: { type: 'json_object' },
                }),
            });
            const data = await res.json();
            return NextResponse.json(JSON.parse(data.choices[0].message.content));
        } catch {
            // Fall through to mock
        }
    }

    // Structured mock response
    const mockResponses: Record<string, object> = {
        default: {
            summary: `Analysis of "${query}": Based on current macroeconomic conditions, the Fed's latest 25bps rate pause has created a favorable environment for risk assets. Technical indicators suggest a consolidation phase before the next directional move. On-chain data shows increased institutional accumulation.`,
            sentiment_score: 34,
            key_risks: [
                'Persistent inflation above 3% could force additional rate hikes',
                'Geopolitical tensions impacting global supply chains',
                'Regulatory uncertainty in crypto markets (SEC ongoing litigation)',
                'Commercial real estate stress bleeding into regional banks',
            ],
            catalysts: [
                'Fed pivot to rate cuts projected for Q2 2026',
                'AI infrastructure spend driving semiconductor demand',
                'Bitcoin halving cycle historically bullish 12-18 months post-event',
                'Strong earnings beats in Mag-7 tech cohort',
            ],
            price_target: 'SPY: $540 (12-month), BTC: $115,000 (cycle peak)',
            bull_factors: [
                'Institutional ETF flows hitting all-time highs',
                'Earnings growth accelerating (+15% YoY estimate)',
                'Dollar weakening supports international revenues',
            ],
            bear_factors: [
                'Consumer credit delinquencies rising at 2008-level pace',
                'Yield curve still inverted (risk of hard landing)',
                'Margin compression in non-tech sectors',
            ],
            technical_outlook: 'S&P 500 is trading above its 200-day moving average with RSI at 58 (not overbought). Key support at 4,800. Bitcoin forming a bull flag on the daily chart; breakout above $90K would target $108K.',
            recommendation: 'BUY',
        },
    };

    return NextResponse.json(mockResponses.default);
}
