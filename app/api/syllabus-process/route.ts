import { NextResponse } from 'next/server';
import { sendAnthropicMessage } from '@/lib/anthropic';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();
  const text = typeof body.text === 'string' ? body.text.trim() : '';

  if (!text) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  try {
    const raw = await sendAnthropicMessage(
      `You are an academic syllabus parser. Return ONLY valid JSON. No markdown. Exact structure:
{
  course_name: string,
  instructor: string (or 'Not specified'),
  total_weeks: number,
  weeks: [
    {
      week: number,
      topic: string,
      readings: string (or 'None'),
      assignments: string (or 'None'),
      deadline: string (date string or 'None')
    }
  ],
  major_assessments: [
    {
      name: string,
      weight: string (e.g. '30%'),
      due_date: string
    }
  ]
}
Parse the following syllabus text.`,
      [
        {
          role: 'user',
          content: text.slice(0, 8000),
        },
      ],
    );

    try {
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json({ error: 'Could not parse syllabus' }, { status: 500 });
    }
  } catch (err) {
    console.error('[syllabus-process] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
