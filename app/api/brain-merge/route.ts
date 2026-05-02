import { NextResponse } from 'next/server';
import { sendAnthropicMessage } from '@/lib/anthropic';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();
  const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
  const field = typeof body.field === 'string' ? body.field.trim() : '';

  if (!topic) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 });
  }

  if (!field) {
    return NextResponse.json({ error: 'field is required' }, { status: 400 });
  }

  try {
    const raw = await sendAnthropicMessage(
      `You are simulating an academic research network. Return ONLY valid JSON. No markdown. Exact structure:
{
  researchers: [
    {
      id: string (uuid format),
      name: string (realistic full name),
      university: string (real university name),
      country: string,
      field: string,
      research_focus: string (1 sentence),
      match_score: number (between 72 and 97),
      recent_paper: string (realistic paper title),
      looking_for: string (what kind of collaborator they need, 1 sentence)
    }
  ]
}
Generate 4 realistic-looking researcher profiles that would be good collaborators for the given research topic.`,
      [
        {
          role: 'user',
          content: `Topic: ${topic}. Field: ${field}`,
        },
      ],
    );

    return NextResponse.json(JSON.parse(raw));
  } catch (err) {
    console.error('[brain-merge] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
