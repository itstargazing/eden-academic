import { NextResponse } from 'next/server';
import { sendAnthropicMessage } from '@/lib/anthropic';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();
  const sectionTitle = typeof body.sectionTitle === 'string' ? body.sectionTitle.trim() : '';
  const sectionDescription =
    typeof body.sectionDescription === 'string' ? body.sectionDescription.trim() : '';
  const topic = typeof body.topic === 'string' ? body.topic.trim() : '';

  if (!sectionTitle) {
    return NextResponse.json({ error: 'sectionTitle is required' }, { status: 400 });
  }

  if (!sectionDescription) {
    return NextResponse.json({ error: 'sectionDescription is required' }, { status: 400 });
  }

  if (!topic) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 });
  }

  try {
    const raw = await sendAnthropicMessage(
      `Return ONLY valid JSON. No markdown. Structure:
{ bullets: ['string', 'string', 'string', 'string'] }
Generate 4 specific, academic-quality bullet points for this thesis section.`,
      [
        {
          role: 'user',
          content: `Section: ${sectionTitle}. Description: ${sectionDescription}. Overall topic: ${topic}`,
        },
      ],
    );

    return NextResponse.json(JSON.parse(raw));
  } catch (err) {
    console.error('[thesis-expand] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
