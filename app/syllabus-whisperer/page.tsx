'use client';

import { useMemo, useRef, useState } from 'react';
import { BookOpen, Loader2, Upload } from 'lucide-react';
import SaveResultsBanner from '@/components/auth/save-results-banner';
import GalaxyAnimation from '@/components/GalaxyAnimation';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import type { SyllabusResult } from '@/lib/eden-types';
import { loadPdfJsForBrowser } from '@/lib/pdfjs-browser';
import { createClient } from '@/lib/supabase/client';

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getDeadlineTone(deadline: string) {
  const now = new Date();
  const due = new Date(deadline);

  if (Number.isNaN(due.getTime())) {
    return 'bg-[var(--bg-panel)] text-[var(--text-dim)]';
  }

  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    return 'bg-[#f3d7d7] text-[var(--text)]';
  }

  if (diffDays <= 14) {
    return 'bg-[#efe4cf] text-[var(--text)]';
  }

  return 'bg-[var(--bg-hover)] text-[var(--text)]';
}

async function extractTextFromPDF(file: File): Promise<string> {
  if (file.name.toLowerCase().endsWith('.txt')) {
    return file.text();
  }

  const pdfjsLib = await loadPdfJsForBrowser();

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;

  const textPages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .filter((item: any) => 'str' in item)
      .map((item: any) => item.str)
      .join(' ');
    textPages.push(pageText);
  }

  const fullText = textPages.join('\n\n');

  if (!fullText || fullText.trim().length < 20) {
    throw new Error('Could not extract text. Make sure this is a text-based PDF, not a scanned image.');
  }

  return fullText;
}

export default function SyllabusWhispererPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const { user } = useSupabaseUser();

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<SyllabusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const handleProcess = async () => {
    if (!file) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSaveMessage('');
      const rawText = await extractTextFromPDF(file);
      const res = await fetch('/api/syllabus-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText.slice(0, 8000) }),
      });
      const data = (await res.json()) as SyllabusResult & { error?: string };
      if (!res.ok) throw new Error(data.error || 'Processing failed');
      setResult(data);
    } catch (err: any) {
      setResult(null);
      setError(err.message || 'Something went wrong. Try a different PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !user || !supabase) {
      return;
    }

    setSaving(true);
    setSaveMessage('');

    const { error: saveError } = await supabase.from('syllabus_data').insert({
      user_id: user.id,
      course_name: result.course_name,
      weeks: result.weeks,
      major_assessments: result.major_assessments,
      created_at: new Date().toISOString(),
    });

    if (saveError) {
      setError('Search failed. Try again.');
    } else {
      setSaveMessage('Saved to your dashboard.');
    }

    setSaving(false);
  };

  return (
    <div className="split-layout min-h-screen w-full max-w-full">
      <div className="split-left flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-panel)] p-6 sm:p-10">
        <GalaxyAnimation label="Syllabus Whisperer" />
      </div>
      <div className="split-right flex min-h-0 w-full max-w-full min-w-0 flex-col gap-6 bg-[var(--bg)] p-6 sm:p-8 xl:overflow-y-auto">
    <div className="feature-page min-w-0 max-w-full space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3">
            <BookOpen size={32} className="text-[var(--text)]" />
          </div>
          <div>
            <h1 className="page-header">Syllabus Whisperer</h1>
            <p className="text-text-secondary">Upload a syllabus and turn it into a structured semester view</p>
          </div>
        </div>
      </section>

      <section className="card space-y-6">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => inputRef.current?.click()}
            className="btn btn-secondary inline-flex items-center gap-2"
          >
            <Upload size={18} />
            Upload PDF
          </button>

          <button
            onClick={handleProcess}
            disabled={!file || loading}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Reading your syllabus...' : 'Process Syllabus'}
          </button>
        </div>

        {file ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-4 py-3 text-sm text-text-secondary">
            {file.name} • {formatFileSize(file.size)}
          </div>
        ) : null}

        {error ? (
          <div style={{ background: '#ffeded', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.75rem 1rem', fontSize: '0.85rem', borderRadius: '4px' }}>
            {error}
            <button
              onClick={() => setError('')}
              style={{ marginLeft: '1rem', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        ) : null}
      </section>

      <section className="space-y-6">
        {loading ? (
          <div className="card flex items-center justify-center gap-3 py-10 text-text-secondary">
            <Loader2 size={20} className="animate-spin" />
            <span>Reading your syllabus...</span>
          </div>
        ) : result ? (
          <>
            <div className="card space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--text)]">{result.course_name}</h2>
                <p className="mt-1 text-text-secondary">{result.instructor}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-text-secondary">
                      <th className="px-3 py-3">Week</th>
                      <th className="px-3 py-3">Topic</th>
                      <th className="px-3 py-3">Readings</th>
                      <th className="px-3 py-3">Assignments</th>
                      <th className="px-3 py-3">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.weeks.map((week) => (
                      <tr key={`${week.week}-${week.topic}`} className="border-b border-[var(--border)] align-top">
                        <td className="px-3 py-3 text-[var(--text)]">{week.week}</td>
                        <td className="px-3 py-3 text-[var(--text)]">{week.topic}</td>
                        <td className="px-3 py-3 text-text-secondary">{week.readings}</td>
                        <td className="px-3 py-3 text-text-secondary">{week.assignments}</td>
                        <td className="px-3 py-3">
                          {week.deadline !== 'None' ? (
                            <span className={`rounded-full px-3 py-1 text-xs ${getDeadlineTone(week.deadline)}`}>
                              {week.deadline}
                            </span>
                          ) : (
                            <span className="text-text-secondary">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="section-title">Major Assessments</h3>
                {user && supabase ? (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                    Save to Dashboard
                  </button>
                ) : null}
              </div>

              {saveMessage ? (
                <div className="rounded-xl border border-[var(--success)] bg-[#eef8ef] px-4 py-3 text-sm text-[var(--success)]">
                  {saveMessage}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                {result.major_assessments.map((assessment) => (
                  <div key={`${assessment.name}-${assessment.due_date}`} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
                    <h4 className="text-lg font-semibold text-[var(--text)]">{assessment.name}</h4>
                    <p className="mt-2 text-sm text-text-secondary">Weight: {assessment.weight}</p>
                    <p className="mt-1 text-sm text-text-secondary">Due: {assessment.due_date}</p>
                  </div>
                ))}
              </div>
            </div>

            <SaveResultsBanner />
          </>
        ) : (
          <div className="card space-y-3 py-10 text-center text-text-secondary">
            <p className="text-[var(--text)] font-medium">Semester preview</p>
            <p className="mx-auto max-w-lg text-sm leading-relaxed">
              Upload a <strong className="text-[var(--text)]">PDF or TXT</strong> syllabus in the section above, then click{' '}
              <strong className="text-[var(--text)]">Process Syllabus</strong>. Your week-by-week topics, readings, deadlines, and major
              assessments will show up here.
            </p>
            {!file ? (
              <p className="text-xs text-[var(--text-dim)]">No file selected yet.</p>
            ) : (
              <p className="text-xs text-[var(--text-dim)]">Ready when you are — press Process Syllabus to parse {file.name}.</p>
            )}
          </div>
        )}
      </section>
    </div>
      </div>
    </div>
  );
}
