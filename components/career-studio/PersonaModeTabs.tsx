'use client';

import { useEffect, useState } from 'react';
import type { PersonaMode, StructuredResume } from '@/lib/career-studio/careerTypes';
import { rewriteForPersona } from '@/lib/career-studio/careerAiService';
import ResumePreview from './ResumePreview';

const MODES: { id: PersonaMode; label: string; hint: string }[] = [
  { id: 'corporate', label: 'Corporate', hint: 'Leadership, scope, measurable outcomes you already stated.' },
  { id: 'startup', label: 'Startup', hint: 'Ownership, velocity, ambiguity, shipping.' },
  { id: 'creative', label: 'Creative', hint: 'Story, taste, collaboration, narrative clarity.' },
  { id: 'technical', label: 'Technical', hint: 'Systems, tools, implementation, tradeoffs.' },
  { id: 'student', label: 'Student / Intern', hint: 'Learning, projects, initiative, potential.' },
];

type Props = {
  baseResume: StructuredResume;
};

export default function PersonaModeTabs({ baseResume }: Props) {
  const [mode, setMode] = useState<PersonaMode>('corporate');
  const [resume, setResume] = useState<StructuredResume>(baseResume);
  const [explanation, setExplanation] = useState<string>('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const out = await rewriteForPersona(baseResume, mode);
        if (!cancelled) {
          setResume(out.resume);
          setExplanation(out.explanation);
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [baseResume, mode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
              mode === m.id
                ? 'border-[var(--text)] bg-[var(--bg-hover)] text-[var(--text)]'
                : 'border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-[var(--text-dim)]">{MODES.find((x) => x.id === mode)?.hint}</p>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 text-sm text-[var(--text-dim)]">
        <span className="font-medium text-[var(--text)]">What changed: </span>
        {busy ? 'Reframing…' : explanation}
      </div>
      <ResumePreview resume={resume} onResumeChange={setResume} />
    </div>
  );
}
