'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, Check, Copy, FileEdit, Loader2, Sparkles } from 'lucide-react';
import SaveResultsBanner from '@/components/auth/save-results-banner';
import GalaxyAnimation from '@/components/GalaxyAnimation';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import type { ThesisOutline, ThesisSection } from '@/lib/eden-types';
import { createClient } from '@/lib/supabase/client';

const STEPS = ['Topic', 'Outline', 'Expand', 'Export'];
const PAPER_TYPES = ['Research Paper', 'Literature Review', 'Thesis', 'Essay'];

function buildPlainText(outline: ThesisOutline | null) {
  if (!outline) {
    return '';
  }

  return [
    outline.title,
    '',
    outline.abstract_draft,
    '',
    ...outline.sections.flatMap((section) => [
      section.title,
      section.description,
      ...section.bullets.map((bullet) => `- ${bullet}`),
      '',
    ]),
  ].join('\n');
}

function buildMarkdown(outline: ThesisOutline | null) {
  if (!outline) {
    return '';
  }

  return [
    `# ${outline.title}`,
    '',
    '## Abstract',
    outline.abstract_draft,
    '',
    ...outline.sections.flatMap((section) => [
      `## ${section.title}`,
      section.description,
      ...section.bullets.map((bullet) => `- ${bullet}`),
      '',
    ]),
  ].join('\n');
}

export default function ThesisSculptorPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useSupabaseUser();

  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [field, setField] = useState('');
  const [paperType, setPaperType] = useState('Research Paper');
  const [outline, setOutline] = useState<ThesisOutline | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandingId, setExpandingId] = useState('');
  const [error, setError] = useState('');
  const [retrySection, setRetrySection] = useState<ThesisSection | null>(null);
  const [lastAction, setLastAction] = useState<'generate' | 'expand' | ''>('');
  const [draftId, setDraftId] = useState('');
  const [copied, setCopied] = useState('');

  const persistDraft = async (nextOutline: ThesisOutline) => {
    if (!user || !supabase) {
      return;
    }

    if (draftId) {
      await supabase
        .from('thesis_drafts')
        .update({
          title: nextOutline.title,
          topic,
          outline: nextOutline,
          updated_at: new Date().toISOString(),
        })
        .eq('id', draftId);
      return;
    }

    const { data } = await supabase
      .from('thesis_drafts')
      .insert({
        user_id: user.id,
        title: nextOutline.title,
        topic,
        outline: nextOutline,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (data?.id) {
      setDraftId(data.id);
    }
  };

  const handleGenerateOutline = async () => {
    if (!topic.trim()) {
      return;
    }

    setLoading(true);
    setError('');
    setLastAction('generate');

    try {
      const response = await fetch('/api/thesis-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          field,
          paperType,
        }),
      });

      const data = (await response.json()) as ThesisOutline & { error?: string };

      if (!response.ok || !data.sections) {
        throw new Error(data.error || 'Outline generation failed');
      }

      setOutline(data);
      setStep(2);
      await persistDraft(data);
    } catch {
      setError('Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExpandSection = async (section: ThesisSection) => {
    setExpandingId(section.id);
    setError('');
    setRetrySection(section);
    setLastAction('expand');

    try {
      const response = await fetch('/api/thesis-expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionTitle: section.title,
          sectionDescription: section.description,
          topic,
        }),
      });

      const data = (await response.json()) as { bullets?: string[]; error?: string };

      if (!response.ok || !data.bullets) {
        throw new Error(data.error || 'Expand failed');
      }

      setOutline((previous) => {
        if (!previous) {
          return previous;
        }

        const nextOutline = {
          ...previous,
          sections: previous.sections.map((item) =>
            item.id === section.id ? { ...item, bullets: data.bullets || [] } : item,
          ),
        };

        void persistDraft(nextOutline);
        return nextOutline;
      });
    } catch {
      setError('Search failed. Try again.');
    } finally {
      setExpandingId('');
    }
  };

  const retry = () => {
    if (lastAction === 'expand' && retrySection) {
      void handleExpandSection(retrySection);
      return;
    }

    void handleGenerateOutline();
  };

  const updateOutline = (updater: (current: ThesisOutline) => ThesisOutline) => {
    setOutline((previous) => {
      if (!previous) {
        return previous;
      }

      const nextOutline = updater(previous);
      void persistDraft(nextOutline);
      return nextOutline;
    });
  };

  return (
    <div className="split-layout min-h-screen w-full max-w-full">
      <div className="split-left flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-panel)] p-6 sm:p-10">
        <GalaxyAnimation label="Thesis Sculptor" />
      </div>
      <div className="split-right flex min-h-0 w-full max-w-full min-w-0 flex-col gap-6 bg-[var(--bg)] p-6 sm:p-8 xl:overflow-y-auto">
    <div className="feature-page min-w-0 max-w-full space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3">
            <FileEdit size={32} className="text-[var(--text)]" />
          </div>
          <div>
            <h1 className="page-header">ThesisSculptor</h1>
            <p className="text-text-secondary">Build a structured academic outline with AI support</p>
          </div>
        </div>
      </section>

      <section className="card space-y-8">
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {STEPS.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = step > stepNumber;
            const isActive = step === stepNumber;

            return (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="flex w-full items-center justify-center gap-2">
                  {index > 0 ? (
                    <div className={`h-0.5 flex-1 ${step > stepNumber ? 'bg-[var(--text-dim)]' : 'bg-[var(--border)]'}`} />
                  ) : (
                    <div className="flex-1" />
                  )}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                      isCompleted || isActive
                        ? 'border-[var(--text)] bg-[var(--bg-hover)] text-[var(--text)]'
                        : 'border-[var(--border)] text-[var(--text-dim)]'
                    }`}
                  >
                    {isCompleted ? <Check size={18} /> : stepNumber}
                  </div>
                  {index < STEPS.length - 1 ? (
                    <div className={`h-0.5 flex-1 ${step > stepNumber ? 'bg-[var(--text-dim)]' : 'bg-[var(--border)]'}`} />
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>
                <span className="min-w-0 text-center text-xs text-text-secondary sm:text-sm">{label}</span>
              </div>
            );
          })}
        </div>

        {error ? (
          <div className="flex flex-col gap-3 rounded-xl border border-[var(--error)] bg-[#ffeded] px-4 py-3 text-[var(--error)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={retry} className="btn btn-secondary">
              Retry
            </button>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="topic" className="block text-sm font-medium text-[var(--text)]">
                Enter your research topic
              </label>
              <input
                id="topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. Ethical multimodal AI for clinical diagnostics"
                className="input"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="field" className="block text-sm font-medium text-[var(--text)]">
                Field of study
              </label>
              <input
                id="field"
                value={field}
                onChange={(event) => setField(event.target.value)}
                placeholder="e.g. Computer Science"
                className="input"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="paperType" className="block text-sm font-medium text-[var(--text)]">
                Paper type
              </label>
              <select
                id="paperType"
                value={paperType}
                onChange={(event) => setPaperType(event.target.value)}
                className="input"
              >
                {PAPER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateOutline}
              disabled={!topic.trim() || loading}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Building your outline...' : 'Generate Outline'}
            </button>
          </div>
        ) : null}

        {step === 2 && outline ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text)]">Suggested title</label>
                <input
                  value={outline.title}
                  onChange={(event) =>
                    updateOutline((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="input"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text)]">Abstract draft</label>
                <textarea
                  rows={4}
                  value={outline.abstract_draft}
                  onChange={(event) =>
                    updateOutline((current) => ({
                      ...current,
                      abstract_draft: event.target.value,
                    }))
                  }
                  className="input"
                />
              </div>
            </div>

            <div className="space-y-4">
              {outline.sections.map((section) => (
                <div key={section.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-[var(--text)]">{section.title}</h3>
                      <p className="text-sm text-text-secondary">{section.description}</p>
                    </div>
                    <button
                      onClick={() => handleExpandSection(section)}
                      disabled={expandingId === section.id}
                      className="btn btn-secondary"
                    >
                      {expandingId === section.id ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Expanding...
                        </span>
                      ) : section.bullets.length > 0 ? (
                        'Re-expand'
                      ) : (
                        'Expand Section'
                      )}
                    </button>
                  </div>

                  {section.bullets.length > 0 ? (
                    <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-text-secondary">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                Back
              </button>
              <button
                onClick={() => {
                  setStep(3);
                  void persistDraft(outline);
                }}
                className="btn btn-primary"
              >
                Continue to Step 3
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 && outline ? (
          <div className="space-y-6">
            <div>
              <h2 className="section-title">Your outline is ready. Review before exporting.</h2>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-6">
              <h3 className="text-2xl font-semibold text-[var(--text)]">{outline.title}</h3>
              <p className="mt-3 text-text-secondary">{outline.abstract_draft}</p>

              <div className="mt-6 space-y-5">
                {outline.sections.map((section) => (
                  <div key={section.id}>
                    <h4 className="text-lg font-semibold text-[var(--text)]">{section.title}</h4>
                    <p className="mt-1 text-sm text-text-secondary">{section.description}</p>
                    {section.bullets.length > 0 ? (
                      <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-text-secondary">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-text-secondary">No bullets expanded yet.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setStep(2)} className="btn btn-secondary">
                Back
              </button>
              <button onClick={() => setStep(4)} className="btn btn-primary">
                Continue to Step 4
              </button>
            </div>
          </div>
        ) : null}

        {step === 4 && outline ? (
          <div className="space-y-6">
            <div>
              <h2 className="section-title">Export your outline</h2>
              <p className="text-text-secondary">Copy the structure in the format that fits your workflow.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(buildPlainText(outline));
                  setCopied('text');
                  window.setTimeout(() => setCopied(''), 2000);
                }}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Copy size={16} />
                {copied === 'text' ? 'Copied as Text' : 'Copy as Text'}
              </button>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(buildMarkdown(outline));
                  setCopied('markdown');
                  window.setTimeout(() => setCopied(''), 2000);
                }}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <Copy size={16} />
                {copied === 'markdown' ? 'Copied as Markdown' : 'Copy as Markdown'}
              </button>
            </div>

            <button onClick={() => setStep(3)} className="btn btn-secondary">
              Back
            </button>
          </div>
        ) : null}
      </section>

      {outline ? <SaveResultsBanner /> : null}
    </div>
      </div>
    </div>
  );
}
