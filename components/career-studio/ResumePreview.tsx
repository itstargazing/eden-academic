'use client';

import { useMemo, useState } from 'react';
import type { BulletImproveAction, StructuredResume, ResumeBullet } from '@/lib/career-studio/careerTypes';
import { improveBullet } from '@/lib/career-studio/careerAiService';

type Props = {
  resume: StructuredResume;
  onResumeChange: (next: StructuredResume) => void;
  proofTagForBullet?: (expId: string, bulletId: string) => boolean;
};

const actions: { key: BulletImproveAction; label: string }[] = [
  { key: 'stronger', label: 'Stronger' },
  { key: 'concise', label: 'Concise' },
  { key: 'metrics', label: 'Metrics' },
  { key: 'professional', label: 'Professional' },
  { key: 'startup', label: 'Startup-style' },
  { key: 'corporate', label: 'Corporate-style' },
];

function updateExpBullet(resume: StructuredResume, expId: string, bulletId: string, text: string): StructuredResume {
  return {
    ...resume,
    experience: resume.experience.map((exp) =>
      exp.id !== expId
        ? exp
        : {
            ...exp,
            bullets: exp.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)),
          }
    ),
  };
}

function updateProjectBullet(resume: StructuredResume, projId: string, bulletId: string, text: string): StructuredResume {
  return {
    ...resume,
    projects: resume.projects.map((p) =>
      p.id !== projId
        ? p
        : { ...p, bullets: p.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)) },
    ),
  };
}

export default function ResumePreview({ resume, onResumeChange, proofTagForBullet }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleImprove = async (
    action: BulletImproveAction,
    bullet: ResumeBullet,
    ctx: { type: 'exp'; expId: string } | { type: 'proj'; projId: string }
  ) => {
    const loadKey = ctx.type === 'exp' ? `${ctx.expId}-${bullet.id}` : `${ctx.projId}-${bullet.id}`;
    setLoading(loadKey);
    try {
      const label = ctx.type === 'exp' ? `Experience ${ctx.expId}` : `Project ${ctx.projId}`;
      const nextText = await improveBullet({
        bulletText: bullet.text,
        action,
        context: label,
      });
      if (ctx.type === 'exp') {
        onResumeChange(updateExpBullet(resume, ctx.expId, bullet.id, nextText));
      } else {
        onResumeChange(updateProjectBullet(resume, ctx.projId, bullet.id, nextText));
      }
    } finally {
      setLoading(null);
    }
  };

  const links = useMemo(() => resume.additionalLinks, [resume.additionalLinks]);

  return (
    <div className="space-y-8 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-4 sm:p-6">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)]">Professional summary</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">{resume.summary}</p>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)]">Education</h3>
        <ul className="mt-3 space-y-3">
          {resume.education.map((e) => (
            <li key={e.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm">
              <div className="font-medium text-[var(--text)]">
                {e.institution} · {e.degree}
              </div>
              <div className="text-xs text-[var(--text-dim)]">{e.dates}</div>
              {e.details ? <p className="mt-2 text-[var(--text-dim)]">{e.details}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)]">Experience</h3>
        <ul className="mt-3 space-y-4">
          {resume.experience.map((exp) => (
            <li key={exp.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-medium text-[var(--text)]">{exp.title}</div>
                <div className="text-xs text-[var(--text-dim)]">{exp.dates}</div>
              </div>
              <div className="text-sm text-[var(--text-dim)]">{exp.company}</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--text)]">
                {exp.bullets.map((b) => (
                  <li key={b.id} className="space-y-2">
                    <div className="flex flex-wrap items-start gap-2">
                      <span>{b.text}</span>
                      {proofTagForBullet?.(exp.id, b.id) ? (
                        <span className="rounded-full border border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--text-dim)]">
                          Proof available
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {actions.map((a) => (
                        <button
                          key={a.key}
                          type="button"
                          disabled={loading === `${exp.id}-${b.id}`}
                          onClick={() => handleImprove(a.key, b, { type: 'exp', expId: exp.id })}
                          className="rounded border border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[10px] text-[var(--text-dim)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
                        >
                          {loading === `${exp.id}-${b.id}` ? '…' : a.label}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)]">Projects</h3>
        <ul className="mt-3 space-y-4">
          {resume.projects.map((p) => (
            <li key={p.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
              <div className="font-medium text-[var(--text)]">{p.name}</div>
              {p.description ? <p className="mt-1 text-sm text-[var(--text-dim)]">{p.description}</p> : null}
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
                {p.bullets.map((b) => (
                  <li key={b.id} className="space-y-2">
                    <span>{b.text}</span>
                    <div className="flex flex-wrap gap-1">
                      {actions.map((a) => (
                        <button
                          key={a.key}
                          type="button"
                          disabled={loading === `${p.id}-${b.id}`}
                          onClick={() => handleImprove(a.key, b, { type: 'proj', projId: p.id })}
                          className="rounded border border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[10px] text-[var(--text-dim)] transition hover:bg-[var(--bg-hover)]"
                        >
                          {loading === `${p.id}-${b.id}` ? '…' : a.label}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)]">Skills</h3>
          <p className="mt-2 text-sm text-[var(--text)]">{resume.skills.join(' · ')}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)]">Certifications</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-[var(--text-dim)]">
            {resume.certifications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)]">Leadership / volunteering</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-[var(--text-dim)]">
            {resume.leadership.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)]">Awards</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-[var(--text-dim)]">
            {resume.awards.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </section>

      {links.length ? (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)]">Additional links</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {links.map((l, i) => (
              <li key={i}>
                <a href={l.url} className="text-[var(--text)] underline decoration-[var(--border)]" target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
