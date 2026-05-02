import { NextResponse } from 'next/server';
import { sendAnthropicMessage } from '@/lib/anthropic';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();
  const answers = body.answers;

  if (!answers) {
    return NextResponse.json({ error: 'answers is required' }, { status: 400 });
  }

  try {
    const raw = await sendAnthropicMessage(
      `You are a learning science expert. Return ONLY valid JSON. No markdown.
Exact structure:
{
  profile_name: string (a creative 2-word name for this learner type, e.g. 'Night Architect'),
  peak_hours: string (e.g. '8PM - 12AM'),
  cognitive_style: string (2-3 sentences describing how this person learns best),
  recommended_session_length: number (in minutes),
  break_duration: number (in minutes),
  focus_technique: string (e.g. 'Pomodoro', 'Deep Work Blocks', 'Ultradian Rhythm'),
  environment_tips: string[] (3 specific tips),
  tools_to_use: string[] (2-3 EDEN tool names from: BrainMerge, ThesisSculptor, GhostCitations, SyllabusWhisperer, FocusSoundscapes, StudyTimeSynch),
  adhd_accommodations: string[] (3 tips — only populate if has_adhd is 'Yes', otherwise empty array)
}
Generate a cognitive learning profile based on these quiz answers.`,
      [
        {
          role: 'user',
          content: JSON.stringify(answers),
        },
      ],
    );

    return NextResponse.json(JSON.parse(raw));
  } catch (err) {
    console.error('[cognitive-profile] error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
