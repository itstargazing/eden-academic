'use client';

import { useCallback, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { EMPTY_PROFILE, type ProfileInput, type ProofCardData, type StudioStep, type StructuredResume } from '@/lib/career-studio/careerTypes';
import { emptyProof, generateResume } from '@/lib/career-studio/careerAiService';
import CareerHero from './CareerHero';
import CareerProgressSteps from './CareerProgressSteps';
import InterviewSimulator from './InterviewSimulator';
import OpportunityMatcher from './OpportunityMatcher';
import PersonaModeTabs from './PersonaModeTabs';
import ProofCard from './ProofCard';
import ResumeInputForm from './ResumeInputForm';
import ResumePreview from './ResumePreview';

function canEnterStep(step: StudioStep, hasResume: boolean): boolean {
  if (step === 1) return true;
  return hasResume;
}

export default function CareerStudioPage() {
  const [step, setStep] = useState<StudioStep>(1);
  const [profile, setProfile] = useState<ProfileInput>(EMPTY_PROFILE);
  const [resume, setResume] = useState<StructuredResume | null>(null);
  const [proofs, setProofs] = useState<Record<string, ProofCardData>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const initProofs = useCallback((r: StructuredResume) => {
    const next: Record<string, ProofCardData> = {};
    r.experience.forEach((e) => {
      next[e.id] = emptyProof(e.id);
    });
    setProofs(next);
  }, []);

  const goStep = (s: StudioStep) => {
    if (!canEnterStep(s, Boolean(resume))) {
      setNotice('Generate your resume first — that unlocks proof, personas, interview practice, and matching.');
      return;
    }
    setNotice(null);
    setStep(s);
  };

  const handleGenerate = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const out = await generateResume(profile);
      setResume(out);
      initProofs(out);
      setStep(2);
    } catch {
      setNotice('Resume generation failed. Check the console or try again.');
    } finally {
      setBusy(false);
    }
  };

  const scrollToInput = () => {
    document.getElementById('career-input')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hasProofSignals = (expId: string) => {
    const p = proofs[expId];
    if (!p) return false;
    return Boolean(p.projectLink.trim() || p.githubLink.trim() || p.websiteLink.trim() || p.resultImpact.trim() || p.whatYouDid.trim());
  };

  const updateProof = (expId: string, next: ProofCardData) => {
    setProofs((prev) => ({ ...prev, [expId]: next }));
  };

  const next = () => goStep((Math.min(6, step + 1) as StudioStep));
  const prev = () => goStep((Math.max(1, step - 1) as StudioStep));

  return (
    <div className="feature-page mx-auto max-w-6xl space-y-8 pb-20">
      {step === 1 ? (
        <CareerHero
          onStartBuilding={scrollToInput}
          onTryInterview={() => {
            if (!resume) {
              setNotice('Generate a resume first — then you can jump straight into the interview simulator.');
              scrollToInput();
              return;
            }
            goStep(5);
          }}
        />
      ) : null}

      <CareerProgressSteps current={step} onSelect={goStep} />

      {notice ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-600/40 bg-[var(--bg)] p-3 text-sm text-[var(--text-dim)]">
          <AlertCircle className="mt-0.5 shrink-0 text-[var(--text)]" size={18} />
          <span>{notice}</span>
        </div>
      ) : null}

      {step === 1 ? (
        <div id="career-input" className="space-y-6">
          <ResumeInputForm value={profile} onChange={setProfile} />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleGenerate()}
              className="btn inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--bg-hover)] px-5 py-2.5 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--bg)] disabled:opacity-50"
            >
              {busy ? <Loader2 className="animate-spin" size={18} /> : null}
              Generate resume
            </button>
            <span className="text-xs text-[var(--text-dim)]">Uses mock AI until your API route is connected (`careerAiService.ts`).</span>
          </div>
        </div>
      ) : null}

      {step === 2 && resume ? (
        <div className="space-y-4">
          <h2 className="page-header text-2xl sm:text-3xl">Your generated resume</h2>
          <p className="text-sm text-[var(--text-dim)]">Edit bullets in place. Use the micro-actions to tighten wording — facts stay yours.</p>
          <ResumePreview
            resume={resume}
            onResumeChange={setResume}
            proofTagForBullet={(expId, _bulletId) => hasProofSignals(expId)}
          />
        </div>
      ) : null}

      {step === 3 && resume ? (
        <div className="space-y-6">
          <h2 className="page-header text-2xl sm:text-3xl">Proof layer</h2>
          <p className="text-sm text-[var(--text-dim)]">
            Attach evidence to experience blocks. Items with links or impact notes show a “Proof available” tag beside bullets in
            your resume preview.
          </p>
          <div className="space-y-6">
            {resume.experience.map((exp) => (
              <ProofCard
                key={exp.id}
                title={`Proof · ${exp.title} @ ${exp.company}`}
                value={proofs[exp.id] || emptyProof(exp.id)}
                onChange={(next) => updateProof(exp.id, { ...next, linkedItemId: exp.id })}
              />
            ))}
          </div>
        </div>
      ) : null}

      {step === 4 && resume ? (
        <div className="space-y-4">
          <h2 className="page-header text-2xl sm:text-3xl">Persona modes</h2>
          <p className="text-sm text-[var(--text-dim)]">Same facts, different lens. Switch tabs to see reframed language (mock).</p>
          <PersonaModeTabs baseResume={resume} />
        </div>
      ) : null}

      {step === 5 && resume ? (
        <div className="space-y-4">
          <h2 className="page-header text-2xl sm:text-3xl">Interview simulator</h2>
          <p className="text-sm text-[var(--text-dim)]">Questions are grounded in your resume JSON. Feedback is mock until your evaluator API is wired.</p>
          <InterviewSimulator resume={resume} targetRole={profile.targetRole} />
        </div>
      ) : null}

      {step === 6 && resume ? (
        <div className="space-y-4">
          <h2 className="page-header text-2xl sm:text-3xl">Opportunity match</h2>
          <p className="text-sm text-[var(--text-dim)]">Skill gaps and projects are suggestive — verify everything against your real experience.</p>
          <OpportunityMatcher resume={resume} targetRole={profile.targetRole} targetIndustry={profile.targetIndustry} />
        </div>
      ) : null}

      {step > 1 ? (
        <div className="sticky bottom-4 z-20 mt-10 flex justify-center">
          <div className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-4 py-3 shadow-lg backdrop-blur-sm">
            <button type="button" onClick={prev} className="btn btn-secondary inline-flex items-center gap-1 px-4 py-2 text-sm">
              <ChevronLeft size={18} /> Back
            </button>
            <span className="text-xs text-[var(--text-dim)]">Step {step} of 6</span>
            <button
              type="button"
              onClick={next}
              disabled={step === 6}
              className="btn inline-flex items-center gap-1 border border-[var(--border)] bg-[var(--bg-hover)] px-4 py-2 text-sm disabled:opacity-40"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
