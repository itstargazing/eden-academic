'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Brain, Clock3, Loader2, Sparkles } from 'lucide-react';
import SaveResultsBanner from '@/components/auth/save-results-banner';
import GalaxyAnimation from '@/components/GalaxyAnimation';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import type { CognitiveAnswers, CognitiveProfileResult } from '@/lib/eden-types';
import { createClient } from '@/lib/supabase/client';

const QUESTIONS = [
  {
    key: 'productivity_time',
    label: 'When do you usually feel most productive?',
    options: ['Early morning', 'Late morning', 'Afternoon', 'Night'],
  },
  {
    key: 'learning_style',
    label: 'How do you retain ideas fastest?',
    options: ['Visual diagrams', 'Reading and notes', 'Discussion', 'Practice and repetition'],
  },
  {
    key: 'distraction_level',
    label: 'How easily do you get distracted while studying?',
    options: ['Rarely', 'Sometimes', 'Often', 'Constantly'],
  },
  {
    key: 'has_adhd',
    label: 'Do you want ADHD-friendly recommendations?',
    options: ['Yes', 'No'],
  },
  {
    key: 'session_length',
    label: 'What study session feels most realistic for you?',
    options: ['20 minutes', '30 minutes', '45 minutes', '60+ minutes'],
  },
] as const;

const TOOL_LINKS: Record<string, string> = {
  BrainMerge: '/brain-merge',
  ThesisSculptor: '/thesis-sculptor',
  GhostCitations: '/ghost-citations',
  SyllabusWhisperer: '/syllabus-whisperer',
  FocusSoundscapes: '/focus-soundscapes',
  StudyTimeSynch: '/studytime-synch',
};

const INITIAL_ANSWERS: CognitiveAnswers = {
  productivity_time: '',
  learning_style: '',
  distraction_level: '',
  has_adhd: '',
  session_length: '',
};

export default function CognitiveCompassPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useSupabaseUser();
  const resultRef = useRef<HTMLDivElement | null>(null);

  const [answers, setAnswers] = useState<CognitiveAnswers>(INITIAL_ANSWERS);
  const [profile, setProfile] = useState<CognitiveProfileResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const allAnswered = answeredCount === 5;

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSaveMessage('');

    try {
      const response = await fetch('/api/cognitive-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      const data = (await response.json()) as CognitiveProfileResult & { error?: string };

      if (!response.ok || !data.profile_name) {
        throw new Error(data.error || 'profile failed');
      }

      setProfile(data);

      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      setError('Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || !user || !supabase) {
      return;
    }

    setSaving(true);
    setSaveMessage('');

    const { error: saveError } = await supabase.from('user_profiles').insert({
      user_id: user.id,
      profile_data: profile,
      created_at: new Date().toISOString(),
    });

    if (saveError) {
      setError('Search failed. Try again.');
    } else {
      setSaveMessage('Profile saved to your dashboard.');
    }

    setSaving(false);
  };

  return (
    <div className="split-layout min-h-screen w-full max-w-full">
      <div className="split-left flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-panel)] p-6 sm:p-10">
        <GalaxyAnimation label="Cognitive Compass" />
      </div>
      <div className="split-right flex min-h-0 w-full max-w-full min-w-0 flex-col gap-6 bg-[var(--bg)] p-6 sm:p-8 xl:overflow-y-auto">
    <div className="feature-page min-w-0 max-w-full space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3">
            <Brain size={32} className="text-[var(--text)]" />
          </div>
          <div>
            <h1 className="page-header">Cognitive Compass</h1>
            <p className="text-text-secondary">Map your focus style and build a study rhythm that fits you</p>
          </div>
        </div>
      </section>

      <section className="card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Learning Profile Quiz</h2>
          <span className="text-sm text-text-secondary">{answeredCount} / 5 answered</span>
        </div>

        {QUESTIONS.map((question) => (
          <div key={question.key} className="space-y-3">
            <p className="text-sm font-medium text-[var(--text)]">{question.label}</p>
            <div className="flex flex-wrap gap-2">
              {question.options.map((option) => {
                const selected = answers[question.key] === option;

                return (
                  <button
                    key={option}
                    onClick={() =>
                      setAnswers((previous) => ({
                        ...previous,
                        [question.key]: option,
                      }))
                    }
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      selected
                        ? 'border-[var(--text)] bg-[var(--bg-hover)] text-[var(--text)]'
                        : 'border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {error ? (
          <div className="flex flex-col gap-3 rounded-xl border border-[var(--error)] bg-[#ffeded] px-4 py-3 text-[var(--error)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={handleSubmit} className="btn btn-secondary">
              Retry
            </button>
          </div>
        ) : null}

        <button
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Analyzing your cognitive patterns...' : 'Get My Profile'}
        </button>
      </section>

      {profile ? (
        <section ref={resultRef} className="space-y-6">
          <div className="card space-y-6">
            <div>
              <h2 className="text-3xl font-semibold text-[var(--text)]">{profile.profile_name}</h2>
              <p className="mt-2 text-text-secondary">{profile.cognitive_style}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
                <p className="text-sm text-text-secondary">Peak Hours</p>
                <div className="mt-3 flex items-center gap-3 text-[var(--text)]">
                  <Clock3 size={18} />
                  <span className="text-lg font-semibold">{profile.peak_hours}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
                <p className="text-sm text-text-secondary">Ideal Session</p>
                <p className="mt-3 text-lg font-semibold text-[var(--text)]">
                  {profile.recommended_session_length} min work / {profile.break_duration} min break
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
                <p className="text-sm text-text-secondary">Focus Technique</p>
                <p className="mt-3 text-lg font-semibold text-[var(--text)]">{profile.focus_technique}</p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
                <p className="text-sm text-text-secondary">Cognitive Style</p>
                <p className="mt-3 text-sm text-text-secondary">{profile.cognitive_style}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="section-title">Environment Tips</h3>
              <ul className="list-disc space-y-2 pl-6 text-text-secondary">
                {profile.environment_tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="section-title">Recommended EDEN Tools</h3>
              <div className="flex flex-wrap gap-2">
                {profile.tools_to_use.map((tool) => (
                  <Link
                    key={tool}
                    href={TOOL_LINKS[tool] || '/'}
                    className="rounded-full border border-[var(--text)] bg-[var(--bg-hover)] px-4 py-2 text-sm text-[var(--text)] transition hover:bg-[var(--bg-panel)]"
                  >
                    {tool}
                  </Link>
                ))}
              </div>
            </div>

            {profile.adhd_accommodations.length > 0 ? (
              <div className="space-y-3">
                <h3 className="section-title">ADHD-Friendly Strategies</h3>
                <ul className="list-disc space-y-2 pl-6 text-text-secondary">
                  {profile.adhd_accommodations.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {saveMessage ? (
              <div className="rounded-xl border border-[var(--success)] bg-[#eef8ef] px-4 py-3 text-sm text-[var(--success)]">
                {saveMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {user && supabase ? (
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  Save Profile
                </button>
              ) : null}

              <button
                onClick={() => {
                  setAnswers(INITIAL_ANSWERS);
                  setProfile(null);
                  setError('');
                  setSaveMessage('');
                }}
                className="btn btn-secondary"
              >
                Retake Quiz
              </button>
            </div>
          </div>

          <SaveResultsBanner />
        </section>
      ) : null}
    </div>
      </div>
    </div>
  );
}
