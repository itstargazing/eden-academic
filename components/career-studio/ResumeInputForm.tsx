'use client';

import type { ProfileInput, ResumeTone } from '@/lib/career-studio/careerTypes';

type Props = {
  value: ProfileInput;
  onChange: (next: ProfileInput) => void;
};

const labelCls = 'block text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]';
const inputCls =
  'input mt-1 w-full border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-ghost)]';
const areaCls =
  `${inputCls} min-h-[88px] resize-y font-mono text-sm`;

const tones: { v: ResumeTone; l: string }[] = [
  { v: 'professional', l: 'Professional' },
  { v: 'concise', l: 'Concise' },
  { v: 'warm', l: 'Warm' },
  { v: 'technical-neutral', l: 'Technical (neutral)' },
];

export default function ResumeInputForm({ value, onChange }: Props) {
  const set = <K extends keyof ProfileInput>(key: K, v: ProfileInput[K]) => onChange({ ...value, [key]: v });

  return (
    <div className="feature-page space-y-8">
      <div className="rounded-lg border border-amber-600/30 bg-[var(--bg)] p-4 text-sm text-[var(--text-dim)]">
        <strong className="text-[var(--text)]">Privacy:</strong> Your resume data may contain personal information.
        Only upload or paste details you are comfortable using for resume generation. File uploads here only capture the
        file name until Supabase Storage is configured with authentication.
      </div>

      <section className="card space-y-4">
        <h2 className="section-title">How you want to import</h2>
        <p className="text-sm text-[var(--text-dim)]">
          Paste links for future extraction — many profiles are protected. If a link cannot be accessed, use the
          fallback box below.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>LinkedIn URL</label>
            <input className={inputCls} value={value.linkedInUrl} onChange={(e) => set('linkedInUrl', e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label className={labelCls}>Portfolio URL</label>
            <input className={inputCls} value={value.portfolioUrl} onChange={(e) => set('portfolioUrl', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>GitHub URL</label>
            <input className={inputCls} value={value.githubUrl} onChange={(e) => set('githubUrl', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Personal website URL</label>
            <input className={inputCls} value={value.personalWebsiteUrl} onChange={(e) => set('personalWebsiteUrl', e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Upload existing resume (file name only for now)</label>
          <input
            type="file"
            className="mt-1 w-full text-sm text-[var(--text-dim)] file:mr-3 file:rounded-md file:border file:border-[var(--border)] file:bg-[var(--bg-panel)] file:px-3 file:py-1.5 file:text-[var(--text)]"
            onChange={(e) => set('resumeFileName', e.target.files?.[0]?.name || '')}
          />
          {value.resumeFileName ? <p className="mt-1 text-xs text-[var(--text-dim)]">Selected: {value.resumeFileName}</p> : null}
        </div>
        <div>
          <label className={labelCls}>Protected pages — paste profile content</label>
          <textarea
            className={areaCls}
            rows={5}
            value={value.pastedProfileFallback}
            onChange={(e) => set('pastedProfileFallback', e.target.value)}
            placeholder="We may not be able to access protected profile pages. Paste your profile content here for a more accurate resume."
          />
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="section-title">Guided fields</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Full name</label>
            <input className={inputCls} value={value.fullName} onChange={(e) => set('fullName', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} type="email" value={value.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} value={value.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Location</label>
            <input className={inputCls} value={value.location} onChange={(e) => set('location', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Target role</label>
            <input className={inputCls} value={value.targetRole} onChange={(e) => set('targetRole', e.target.value)} placeholder="e.g. UX/UI Intern" />
          </div>
          <div>
            <label className={labelCls}>Target industry</label>
            <input className={inputCls} value={value.targetIndustry} onChange={(e) => set('targetIndustry', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Preferred resume tone</label>
            <select className={inputCls} value={value.resumeTone} onChange={(e) => set('resumeTone', e.target.value as ResumeTone)}>
              {tones.map((t) => (
                <option key={t.v} value={t.v}>
                  {t.l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="section-title">Experience & proof sources</h2>
        <div className="grid gap-4">
          <div>
            <label className={labelCls}>Education (one block per school; optional: School | Degree | Dates then details)</label>
            <textarea className={areaCls} rows={4} value={value.education} onChange={(e) => set('education', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Work experience (bullet lines with - prefix encouraged)</label>
            <textarea className={areaCls} rows={6} value={value.workExperience} onChange={(e) => set('workExperience', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Projects</label>
            <textarea className={areaCls} rows={5} value={value.projects} onChange={(e) => set('projects', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Skills (comma or line separated)</label>
            <textarea className={areaCls} rows={3} value={value.skills} onChange={(e) => set('skills', e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Certifications</label>
              <textarea className={areaCls} rows={3} value={value.certifications} onChange={(e) => set('certifications', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Awards</label>
              <textarea className={areaCls} rows={3} value={value.awards} onChange={(e) => set('awards', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Volunteering / leadership</label>
              <textarea className={areaCls} rows={3} value={value.volunteering} onChange={(e) => set('volunteering', e.target.value)} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
