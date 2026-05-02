import { NextResponse } from 'next/server';
import { sendAnthropicMessage } from '@/lib/anthropic';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const sources = Array.isArray(body.sources) ? body.sources : [];

  if (!description) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  }

  if (!body.sources) {
    return NextResponse.json({ error: 'sources is required' }, { status: 400 });
  }

  try {
    const raw = await sendAnthropicMessage(
      `You are an academic citation assistant. Return ONLY valid JSON. No markdown, no explanation, no code blocks. Return exactly this structure:
{ 
  citations: [
    {
      id: string (uuid v4 format),
      authors: string (e.g. 'Smith, J., & Doe, A.'),
      year: number,
      title: string,
      journal: string,
      volume: string,
      issue: string,
      pages: string,
      doi: string (format: 10.XXXX/XXXXX),
      sources_likely: string[] (subset of the sources passed in)
    }
  ]
}
Generate 4 highly plausible academic citations based on the user's description.`,
      [
        {
          role: 'user',
          content: `Description: ${description}. Likely sources: ${sources.join(', ')}`,
        },
      ],
    );

    let parsed: { citations: unknown[] };

    try {
      parsed = JSON.parse(raw) as { citations: unknown[] };
    } catch {
      return NextResponse.json({ error: 'Parse failed' }, { status: 500 });
    }

    return NextResponse.json({ citations: parsed.citations ?? [] });
  } catch (err) {
    console.error('[ghost-citations] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
