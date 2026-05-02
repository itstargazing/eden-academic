'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, Copy, ExternalLink, Loader2, Search } from 'lucide-react';
import SaveResultsBanner from '@/components/auth/save-results-banner';
import GalaxyAnimation from '@/components/GalaxyAnimation';
import type { GhostCitation } from '@/lib/eden-types';

const SOURCE_OPTIONS = [
  'Google Scholar',
  'JSTOR',
  'ArXiv',
  'PubMed',
  'Science Direct',
  'IEEE Xplore',
  'ACM Digital Library',
  'SpringerLink',
];

const FORMATS = ['APA', 'MLA', 'Chicago'] as const;

type CitationFormat = (typeof FORMATS)[number];

function formatCitation(citation: GhostCitation, format: CitationFormat) {
  if (format === 'MLA') {
    return `${citation.authors.split(',')[0]} et al. "${citation.title}." ${citation.journal}, vol. ${citation.volume}, no. ${citation.issue}, ${citation.year}, pp. ${citation.pages}.`;
  }

  if (format === 'Chicago') {
    return `${citation.authors}. "${citation.title}." ${citation.journal} ${citation.volume}, no. ${citation.issue} (${citation.year}): ${citation.pages}.`;
  }

  return `${citation.authors} (${citation.year}). ${citation.title}. ${citation.journal}, ${citation.volume}(${citation.issue}), ${citation.pages}. https://doi.org/${citation.doi}`;
}

export default function GhostCitationsPage() {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [citations, setCitations] = useState<GhostCitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formats, setFormats] = useState<Record<string, CitationFormat>>({});
  const [copiedId, setCopiedId] = useState('');

  const hasSearched = citations.length > 0 || loading || Boolean(error);

  const toggleSource = (source: string) => {
    setSelectedSources((previous) =>
      previous.includes(source)
        ? previous.filter((item) => item !== source)
        : [...previous, source],
    );
  };

  const handleSearch = async () => {
    if (description.trim() === '') {
      setError('Please describe the reference');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ghost-citations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          sources: selectedSources,
        }),
      });

      const data = (await response.json()) as { citations?: GhostCitation[]; error?: string };

      if (!response.ok || !data.citations) {
        throw new Error(data.error || 'Search failed');
      }

      setCitations(data.citations);
      setFormats(
        data.citations.reduce<Record<string, CitationFormat>>((accumulator, citation) => {
          accumulator[citation.id] = 'APA';
          return accumulator;
        }, {}),
      );

      const existing = JSON.parse(localStorage.getItem('eden-citations') || '[]') as GhostCitation[];
      const nextSaved = [...data.citations, ...existing].slice(0, 50);
      localStorage.setItem('eden-citations', JSON.stringify(nextSaved));
    } catch {
      setError('Search failed. Try again.');
      setCitations([]);
    } finally {
      setLoading(false);
    }
  };

  const renderedResults = useMemo(() => {
    if (loading) {
      return (
        <div className="card flex items-center justify-center gap-3 py-10 text-text-secondary">
          <Loader2 size={20} className="animate-spin" />
          <span>Searching citations...</span>
        </div>
      );
    }

    if (!hasSearched) {
      return (
        <div className="card py-10 text-center text-text-secondary">
          Describe a reference above to find it
        </div>
      );
    }

    if (!citations.length) {
      return null;
    }

    return (
      <div className="space-y-4">
        {citations.map((citation) => {
          const currentFormat = formats[citation.id] || 'APA';
          const citationText = formatCitation(citation, currentFormat);

          return (
            <div key={citation.id} className="card space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[var(--text)]">{citation.title}</h3>
                <p className="text-text-secondary">
                  {citation.authors} - {citation.year}
                </p>
                <p className="text-sm text-text-secondary">
                  {citation.journal}, {citation.volume}({citation.issue}), {citation.pages}
                </p>
                <a
                  href={`https://doi.org/${citation.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full flex-wrap items-center gap-2 break-all text-sm text-[var(--text)] transition"
                >
                  https://doi.org/{citation.doi}
                  <ExternalLink size={14} />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {FORMATS.map((format) => (
                  <button
                    key={format}
                    onClick={() =>
                      setFormats((previous) => ({
                        ...previous,
                        [citation.id]: format,
                      }))
                    }
                    className={`rounded-full border px-3 py-1 text-sm transition ${
                      currentFormat === format
                        ? 'border-[var(--text)] bg-[var(--bg-hover)] text-[var(--text)]'
                        : 'border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-4 text-sm text-text-secondary break-words">
                {citationText}
              </div>

              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(citationText);
                  setCopiedId(citation.id);
                  window.setTimeout(() => setCopiedId(''), 2000);
                }}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <Copy size={16} />
                {copiedId === citation.id ? 'Copied' : 'Copy'}
              </button>
            </div>
          );
        })}
      </div>
    );
  }, [citations, copiedId, formats, hasSearched, loading]);

  return (
    <div className="split-layout min-h-screen w-full max-w-full">
      <div className="split-left flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-panel)] p-6 sm:p-10">
        <GalaxyAnimation label="Ghost Citations" />
      </div>
      <div className="split-right flex min-h-0 w-full max-w-full min-w-0 flex-col gap-6 bg-[var(--bg)] p-6 sm:p-8 xl:overflow-y-auto">
    <div className="feature-page min-w-0 max-w-full space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3">
            <Search size={32} className="text-[var(--text)]" />
          </div>
          <div>
            <h1 className="page-header">GhostCitations</h1>
            <p className="text-text-secondary">Recover plausible academic references from memory</p>
          </div>
        </div>
      </section>

      <section className="card space-y-6">
        <div className="space-y-2">
          <label htmlFor="ghost-description" className="block text-sm font-medium text-[var(--text)]">
            Describe what you remember about the reference
          </label>
          <textarea
            id="ghost-description"
            rows={5}
            className="input"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="e.g. A 2023 paper on multimodal learning analytics in undergraduate STEM courses"
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--text)]">Likely sources</p>
          <div className="flex flex-wrap gap-2">
            {SOURCE_OPTIONS.map((source) => {
              const selected = selectedSources.includes(source);

              return (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    selected
                      ? 'border-[var(--text)] bg-[var(--bg-hover)] text-[var(--text)]'
                      : 'border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                  }`}
                >
                  {source}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-text-secondary">{selectedSources.length} sources selected</p>
        </div>

        {error ? (
          <div className="flex flex-col gap-3 rounded-xl border border-[var(--error)] bg-[#ffeded] px-4 py-3 text-[var(--error)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={handleSearch} className="btn btn-secondary">
              Retry
            </button>
          </div>
        ) : null}

        <button
          onClick={handleSearch}
          disabled={loading}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          Search Citations
        </button>
      </section>

      <section className="space-y-4">
        {renderedResults}
        <SaveResultsBanner />
      </section>
    </div>
      </div>
    </div>
  );
}
