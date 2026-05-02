'use client';

import type { ProofCardData } from '@/lib/career-studio/careerTypes';

type Props = {
  value: ProofCardData;
  onChange: (next: ProofCardData) => void;
  title?: string;
};

export default function ProofCard({ value, onChange, title = 'Proof card' }: Props) {
  const set = <K extends keyof ProofCardData>(k: K, v: ProofCardData[K]) => onChange({ ...value, [k]: v });

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-[var(--text)]">{title}</h4>
        <span className="rounded border border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
          evidence
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-[var(--text-dim)]">
          Project link
          <input className="input mt-1 w-full" value={value.projectLink} onChange={(e) => set('projectLink', e.target.value)} />
        </label>
        <label className="block text-xs text-[var(--text-dim)]">
          GitHub link
          <input className="input mt-1 w-full" value={value.githubLink} onChange={(e) => set('githubLink', e.target.value)} />
        </label>
        <label className="block text-xs text-[var(--text-dim)] sm:col-span-2">
          Website link
          <input className="input mt-1 w-full" value={value.websiteLink} onChange={(e) => set('websiteLink', e.target.value)} />
        </label>
        <label className="block text-xs text-[var(--text-dim)] sm:col-span-2">
          Screenshot (placeholder — wire Supabase Storage with auth for uploads)
          <input
            className="input mt-1 w-full"
            value={value.screenshotPlaceholder}
            onChange={(e) => set('screenshotPlaceholder', e.target.value)}
          />
        </label>
        <label className="block text-xs text-[var(--text-dim)] sm:col-span-2">
          Result / impact
          <textarea className="input mt-1 min-h-[72px] w-full resize-y" value={value.resultImpact} onChange={(e) => set('resultImpact', e.target.value)} />
        </label>
        <label className="block text-xs text-[var(--text-dim)] sm:col-span-2">
          What you actually did
          <textarea className="input mt-1 min-h-[72px] w-full resize-y" value={value.whatYouDid} onChange={(e) => set('whatYouDid', e.target.value)} />
        </label>
        <label className="block text-xs text-[var(--text-dim)] sm:col-span-2">
          Skills used
          <input className="input mt-1 w-full" value={value.skillsUsed} onChange={(e) => set('skillsUsed', e.target.value)} />
        </label>
        <label className="block text-xs text-[var(--text-dim)] sm:col-span-2">
          Evidence strength (1–5)
          <input
            type="range"
            min={1}
            max={5}
            className="mt-2 w-full accent-[var(--text-dim)]"
            value={value.evidenceStrength}
            onChange={(e) => set('evidenceStrength', Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
