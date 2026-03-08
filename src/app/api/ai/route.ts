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
        } catch (error: any) {
            return NextResponse.json({ error: `AI analysis failed: ${error.message}` }, { status: 502 });
        }
    }

    return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured on the server. AI analysis is disabled.' },
        { status: 403 }
    );
}
