import { NextResponse } from 'next/server';
import { sendAnthropicMessage } from '@/lib/anthropic';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();
  const messages = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
  const systemPrompt =
    typeof body.systemPrompt === 'string' ? body.systemPrompt.trim() : '';

  if (!body.messages) {
    return NextResponse.json({ error: 'messages is required' }, { status: 400 });
  }

  if (!systemPrompt) {
    return NextResponse.json({ error: 'systemPrompt is required' }, { status: 400 });
  }

  try {
    const reply = await sendAnthropicMessage(systemPrompt, messages);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[study-coach] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
