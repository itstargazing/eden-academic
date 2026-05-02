'use client';

type Props = {
  title?: string;
  score: number;
  subtitle?: string;
};

export default function ResumeScoreCard({ title = 'Resume readiness', score, subtitle }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-[var(--text-dim)]">{subtitle}</p> : null}
        </div>
        <div className="text-right">
          <div className="font-[family-name:var(--font-unbounded)] text-3xl text-[var(--text)]">{clamped}</div>
          <div className="text-[10px] uppercase tracking-widest text-[var(--text-ghost)]">/ 100</div>
        </div>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--bg)]">
        <div className="h-full rounded-full bg-[var(--text-dim)] transition-all" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
