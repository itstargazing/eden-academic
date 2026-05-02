import { NextResponse } from 'next/server';
import { sendAnthropicMessage } from '@/lib/anthropic';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();
  const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
  const field = typeof body.field === 'string' ? body.field.trim() : '';
  const paperType = typeof body.paperType === 'string' ? body.paperType.trim() : '';

  if (!topic) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 });
  }

  if (!field) {
    return NextResponse.json({ error: 'field is required' }, { status: 400 });
  }

  if (!paperType) {
    return NextResponse.json({ error: 'paperType is required' }, { status: 400 });
  }

  try {
    const raw = await sendAnthropicMessage(
      `You are an academic writing assistant. Return ONLY valid JSON. No markdown. Exact structure:
{
  title: string (suggested paper title),
  abstract_draft: string (2 sentences),
  sections: [
    {
      id: string (e.g. 'section-1'),
      title: string (e.g. 'Introduction'),
      description: string (1 sentence describing what this section covers),
      bullets: [] (empty array — will be filled on expand)
    }
  ]
}
Generate a complete outline for a ${paperType} on the given topic. 
Include 6-8 sections appropriate to the paper type.`,
      [
        {
          role: 'user',
          content: `Topic: ${topic}. Field: ${field}. Paper type: ${paperType}`,
        },
      ],
    );

    return NextResponse.json(JSON.parse(raw));
  } catch (err) {
    console.error('[thesis-outline] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
