'use client';

import { useEffect, useState } from 'react';
import type { OpportunityMatchResult, StructuredResume } from '@/lib/career-studio/careerTypes';
import { matchOpportunities } from '@/lib/career-studio/careerAiService';
import { Loader2, Target } from 'lucide-react';
import ResumeScoreCard from './ResumeScoreCard';

type Props = {
  resume: StructuredResume;
  targetRole: string;
  targetIndustry: string;
};

export default function OpportunityMatcher({ resume, targetRole, targetIndustry }: Props) {
  const [data, setData] = useState<OpportunityMatchResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const out = await matchOpportunities({ resume, targetRole, targetIndustry });
      if (!cancelled) setData(out);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [resume, targetRole, targetIndustry]);

  if (loading || !data) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
        <Loader2 className="animate-spin" size={18} /> Mapping opportunities to your resume…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResumeScoreCard score={data.readinessScore} subtitle={data.realisticLevel} />

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
        <div className="flex items-center gap-2 text-[var(--text)]">
          <Target size={18} />
          <h3 className="text-sm font-semibold">Fit summary</h3>
        </div>
        <p className="mt-3 text-sm text-[var(--text-dim)]">{data.summary}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-dim)]">Best-fit roles</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {data.bestFitRoles.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2 last:border-0">
                <span className="text-[var(--text)]">{r.title}</span>
                <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase text-[var(--text-dim)]">{r.match}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-dim)]">Strong skills</h4>
          <p className="mt-3 text-sm text-[var(--text)]">{data.strongSkills.join(' · ')}</p>
          <h4 className="mt-6 text-xs font-semibold uppercase tracking-widest text-[var(--text-dim)]">Skill gaps</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-dim)]">
            {data.skillGaps.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 lg:col-span-2">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-dim)]">Suggested projects</h4>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--text-dim)]">
            {data.suggestedProjects.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <h4 className="mt-6 text-xs font-semibold uppercase tracking-widest text-[var(--text-dim)]">Keywords to weave in (honestly)</h4>
          <p className="mt-2 text-sm text-[var(--text)]">{data.keywordsToAdd.join(' · ')}</p>
        </section>
      </div>
    </div>
  );
}
