'use client';

import { useCallback, useEffect, useState } from 'react';
import type { InterviewEvaluation, InterviewMode, InterviewQuestion, StructuredResume } from '@/lib/career-studio/careerTypes';
import { evaluateInterviewAnswer, generateInterviewQuestions } from '@/lib/career-studio/careerAiService';
import { ChevronRight, Loader2, MessageSquare } from 'lucide-react';

const MODES: { id: InterviewMode; label: string }[] = [
  { id: 'hr', label: 'HR' },
  { id: 'technical', label: 'Technical' },
  { id: 'founder', label: 'Startup founder' },
  { id: 'university', label: 'University / internship' },
  { id: 'behavioral', label: 'Behavioral' },
];

type Props = {
  resume: StructuredResume;
  targetRole: string;
};

export default function InterviewSimulator({ resume, targetRole }: Props) {
  const [mode, setMode] = useState<InterviewMode>('hr');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [loadingA, setLoadingA] = useState(false);

  const loadQuestions = useCallback(async () => {
    setLoadingQ(true);
    setEvaluation(null);
    setAnswer('');
    setIdx(0);
    try {
      const qs = await generateInterviewQuestions({ resume, targetRole, mode });
      setQuestions(qs);
    } finally {
      setLoadingQ(false);
    }
  }, [resume, targetRole, mode]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const current = questions[idx];

  const submitAnswer = async () => {
    if (!current) return;
    setLoadingA(true);
    try {
      const ev = await evaluateInterviewAnswer({
        question: current.question,
        userAnswer: answer,
        resume,
        targetRole,
      });
      setEvaluation(ev);
    } finally {
      setLoadingA(false);
    }
  };

  const nextQuestion = () => {
    setEvaluation(null);
    setAnswer('');
    setIdx((i) => Math.min(i + 1, Math.max(0, questions.length - 1)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <MessageSquare size={18} className="text-[var(--text-dim)]" />
        <span className="text-xs uppercase tracking-widest text-[var(--text-dim)]">Interview mode</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              mode === m.id ? 'border-[var(--text)] bg-[var(--bg-hover)]' : 'border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loadingQ ? (
        <div className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
          <Loader2 className="animate-spin" size={18} /> Generating questions from your resume…
        </div>
      ) : current ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-5 space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-[var(--text-ghost)]">
            Question {idx + 1} / {questions.length} · {current.difficulty}
          </div>
          <h3 className="text-lg font-medium text-[var(--text)]">{current.question}</h3>
          <p className="text-sm text-[var(--text-dim)]">
            <span className="font-medium text-[var(--text)]">Direction: </span>
            {current.expectedDirection}
          </p>
          <textarea
            className="input min-h-[140px] w-full resize-y border-[var(--border)] bg-[var(--bg)] text-sm"
            placeholder="Type your answer. Ground it in what you actually did."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loadingA || !answer.trim()}
              onClick={() => void submitAnswer()}
              className="btn border border-[var(--border)] bg-[var(--bg-hover)] px-4 py-2 text-sm disabled:opacity-50"
            >
              {loadingA ? <Loader2 className="animate-spin" size={18} /> : 'Get feedback'}
            </button>
            <button type="button" onClick={nextQuestion} className="btn btn-secondary inline-flex items-center gap-1 px-4 py-2 text-sm">
              Next question
              <ChevronRight size={16} />
            </button>
          </div>

          {evaluation ? (
            <div className="space-y-4 border-t border-[var(--border)] pt-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ['Clarity', evaluation.clarityScore],
                    ['Confidence', evaluation.confidenceScore],
                    ['Specificity', evaluation.specificityScore],
                    ['Evidence', evaluation.evidenceScore],
                    ['Role fit', evaluation.relevanceScore],
                    ['Overall', evaluation.overallScore],
                  ] as const
                ).map(([label, score]) => (
                  <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-dim)]">{label}</div>
                    <div className="text-xl font-semibold text-[var(--text)]">{score}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[var(--text)]">{evaluation.feedback}</p>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm text-[var(--text-dim)]">
                <span className="font-medium text-[var(--text)]">Stronger answer sketch: </span>
                {evaluation.improvedAnswer}
              </div>
              <div className="text-sm text-[var(--text-dim)]">
                <span className="font-medium text-[var(--text)]">Follow-up: </span>
                {evaluation.followUpQuestion}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-dim)]">No questions yet — add more resume detail and regenerate.</p>
      )}
    </div>
  );
}
