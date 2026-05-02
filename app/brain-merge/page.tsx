'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, BrainCircuit, Loader2, Send } from 'lucide-react';
import SaveResultsBanner from '@/components/auth/save-results-banner';
import GalaxyAnimation from '@/components/GalaxyAnimation';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import type { BrainMergeResearcher } from '@/lib/eden-types';
import { createClient } from '@/lib/supabase/client';

const COUNTRY_FLAGS: Record<string, string> = {
  Australia: '\uD83C\uDDE6\uD83C\uDDFA',
  Canada: '\uD83C\uDDE8\uD83C\uDDE6',
  China: '\uD83C\uDDE8\uD83C\uDDF3',
  France: '\uD83C\uDDEB\uD83C\uDDF7',
  Germany: '\uD83C\uDDE9\uD83C\uDDEA',
  India: '\uD83C\uDDEE\uD83C\uDDF3',
  Japan: '\uD83C\uDDEF\uD83C\uDDF5',
  Netherlands: '\uD83C\uDDF3\uD83C\uDDF1',
  Singapore: '\uD83C\uDDF8\uD83C\uDDEC',
  'South Korea': '\uD83C\uDDF0\uD83C\uDDF7',
  Switzerland: '\uD83C\uDDE8\uD83C\uDDED',
  'United Kingdom': '\uD83C\uDDEC\uD83C\uDDE7',
  'United States': '\uD83C\uDDFA\uD83C\uDDF8',
};

function getFlag(country: string) {
  return COUNTRY_FLAGS[country] || '\uD83C\uDF0D';
}

function getScoreTone(score: number) {
  if (score >= 90) {
    return 'bg-[var(--bg-hover)] text-[var(--text)]';
  }

  if (score >= 80) {
    return 'bg-[var(--bg-panel)] text-[var(--text)]';
  }

    return 'bg-[var(--bg-panel)] text-[var(--text-dim)]';
}

export default function BrainMergePage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useSupabaseUser();

  const [activeTab, setActiveTab] = useState<'matches' | 'share'>('matches');
  const [topic, setTopic] = useState('');
  const [field, setField] = useState('');
  const [matches, setMatches] = useState<BrainMergeResearcher[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [success, setSuccess] = useState('');
  const [researchTitle, setResearchTitle] = useState('');
  const [researchAbstract, setResearchAbstract] = useState('');
  const [researchTags, setResearchTags] = useState('');
  const [university, setUniversity] = useState('');

  const handleFindMatches = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/brain-merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, field }),
      });

      const data = (await response.json()) as { researchers?: BrainMergeResearcher[]; error?: string };

      if (!response.ok || !data.researchers) {
        throw new Error(data.error || 'matches failed');
      }

      setMatches(data.researchers);
    } catch {
      setError('Search failed. Try again.');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !supabase) {
      return;
    }

    setPublishing(true);
    setError('');
    setSuccess('');

    const { error: saveError } = await supabase.from('research_profiles').insert({
      user_id: user.id,
      title: researchTitle,
      abstract: researchAbstract,
      tags: researchTags.split(',').map((tag) => tag.trim()).filter(Boolean),
      university,
      created_at: new Date().toISOString(),
    });

    if (saveError) {
      setError('Search failed. Try again.');
    } else {
      setSuccess('Your research is now visible to other researchers on EDEN');
    }

    setPublishing(false);
  };

  return (
    <div className="split-layout min-h-screen w-full max-w-full">
      <div className="split-left flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-panel)] p-6 sm:p-10">
        <GalaxyAnimation label="BrainMerge" />
      </div>
      <div className="split-right flex min-h-0 w-full max-w-full min-w-0 flex-col gap-6 bg-[var(--bg)] p-6 sm:p-8 xl:overflow-y-auto">
    <div className="feature-page min-w-0 max-w-full space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3">
            <BrainCircuit size={32} className="text-[var(--text)]" />
          </div>
          <div>
            <h1 className="page-header">BrainMerge</h1>
            <p className="text-text-secondary">Find collaborators and share your own research with the EDEN network</p>
          </div>
        </div>
      </section>

      <section className="card space-y-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('matches')}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activeTab === 'matches'
                ? 'border-[var(--text)] bg-[var(--bg-hover)] text-[var(--text)]'
                : 'border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
            }`}
          >
            Find Similar Research
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activeTab === 'share'
                ? 'border-[var(--text)] bg-[var(--bg-hover)] text-[var(--text)]'
                : 'border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
            }`}
          >
            Share My Research
          </button>
        </div>

        {error ? (
          <div className="flex flex-col gap-3 rounded-xl border border-[var(--error)] bg-[#ffeded] px-4 py-3 text-[var(--error)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button
              onClick={activeTab === 'matches' ? handleFindMatches : handlePublish}
              className="btn btn-secondary"
            >
              Retry
            </button>
          </div>
        ) : null}

        {activeTab === 'matches' ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="topic" className="block text-sm font-medium text-[var(--text)]">
                What is your research about?
              </label>
              <input
                id="topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. Machine learning for early Alzheimer's detection"
                className="input"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="field" className="block text-sm font-medium text-[var(--text)]">
                Your field of study
              </label>
              <input
                id="field"
                value={field}
                onChange={(event) => setField(event.target.value)}
                placeholder="e.g. Computer Science"
                className="input"
              />
            </div>

            <button
              onClick={handleFindMatches}
              disabled={!topic.trim() || !field.trim() || loading}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Finding your research matches...' : 'Find Matches'}
            </button>

            <div className="space-y-4">
              {matches.map((researcher) => (
                <div key={researcher.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-[var(--text)]">
                        {researcher.name} <span className="ml-2">{getFlag(researcher.country)}</span>
                      </h3>
                      <p className="text-text-secondary">
                        {[researcher.university, researcher.country].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm ${getScoreTone(researcher.match_score)}`}>
                      {researcher.match_score}% match
                    </span>
                  </div>

                  <p className="mt-4 text-text-secondary">{researcher.research_focus}</p>
                  <p className="mt-3 text-sm italic text-text-secondary">
                    Recent paper: {researcher.recent_paper}
                  </p>
                  <p className="mt-3 text-sm text-text-secondary">Looking for: {researcher.looking_for}</p>

                  <button
                    onClick={() => {
                      setToast(`Connection request sent to ${researcher.name}!`);
                      window.setTimeout(() => setToast(''), 2000);
                    }}
                    className="btn btn-secondary mt-4 inline-flex items-center gap-2"
                  >
                    <Send size={16} />
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text)]">Your research title</label>
              <input
                value={researchTitle}
                onChange={(event) => setResearchTitle(event.target.value)}
                className="input"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text)]">Brief abstract (2-3 sentences)</label>
              <textarea
                rows={5}
                value={researchAbstract}
                onChange={(event) => setResearchAbstract(event.target.value)}
                className="input"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text)]">Tags (comma separated)</label>
              <input
                value={researchTags}
                onChange={(event) => setResearchTags(event.target.value)}
                placeholder="e.g. AI, healthcare, NLP"
                className="input"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text)]">Your university</label>
              <input
                value={university}
                onChange={(event) => setUniversity(event.target.value)}
                className="input"
              />
            </div>

            {success ? (
              <div className="rounded-xl border border-[var(--success)] bg-[#eef8ef] px-4 py-3 text-sm text-[var(--success)]">
                {success}
              </div>
            ) : null}

            <button
              onClick={handlePublish}
              disabled={
                !user ||
                !supabase ||
                !researchTitle.trim() ||
                !researchAbstract.trim() ||
                !researchTags.trim() ||
                !university.trim() ||
                publishing
              }
              className="btn btn-primary inline-flex items-center gap-2"
            >
              {publishing ? <Loader2 size={18} className="animate-spin" /> : null}
              Publish to EDEN Network
            </button>
          </div>
        )}
      </section>

      <SaveResultsBanner />

      {toast ? (
        <div className="fixed bottom-6 right-6 rounded-xl border border-[var(--success)] bg-[#eef8ef] px-4 py-3 text-sm text-[var(--success)] shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
      </div>
    </div>
  );
}
