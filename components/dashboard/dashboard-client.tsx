'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Clock3, Loader2, MessageSquare, Send, Sparkles } from 'lucide-react';
import type {
  DashboardProfileRecord,
  DashboardSyllabusRecord,
  DashboardThesisRecord,
  GhostCitation,
} from '@/lib/eden-types';

type DashboardClientProps = {
  profile: DashboardProfileRecord | null;
  thesis: DashboardThesisRecord | null;
  syllabus: DashboardSyllabusRecord | null;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type UpcomingDeadline = {
  name: string;
  daysRemaining: number;
  dateLabel: string;
};

const PROMPT_CHIPS = [
  'What should I work on today?',
  'Help me break down my next deadline',
  "I'm overwhelmed, where do I start?",
];

function daysUntil(dateString: string) {
  const now = new Date();
  const dueDate = new Date(dateString);

  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  return Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDeadlineTone(daysRemaining: number) {
  if (daysRemaining < 3) {
    return 'bg-red-900 text-red-200';
  }

  if (daysRemaining < 7) {
    return 'bg-amber-900 text-amber-200';
  }

  return 'bg-emerald-900 text-emerald-200';
}

function formatTimer(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function buildSystemPrompt(
  profile: DashboardProfileRecord | null,
  upcomingDeadline: UpcomingDeadline | null,
  thesis: DashboardThesisRecord | null,
) {
  const lines = [
    "You are EDEN's AI Study Coach for a university student. Be direct, specific, and encouraging - never generic. Keep every response under 5 sentences.",
    '',
    'What you know about this student:',
  ];

  if (profile?.profile_data) {
    lines.push(
      `- Cognitive profile: ${profile.profile_data.profile_name}, peak hours: ${profile.profile_data.peak_hours}, technique: ${profile.profile_data.focus_technique}`,
    );
  }

  if (upcomingDeadline) {
    lines.push(`- Next deadline: ${upcomingDeadline.name} in ${upcomingDeadline.daysRemaining} days`);
  }

  if (thesis?.title) {
    lines.push(`- Active thesis topic: ${thesis.title}`);
  }

  if (profile?.profile_data) {
    lines.push(
      `- Has ADHD accommodations: ${profile.profile_data.adhd_accommodations.length > 0 ? 'yes' : 'no'}`,
    );
  }

  lines.push('');
  lines.push("If you don't know something, don't mention it. Focus only on what you know.");
  lines.push("Never say 'I don't have information about'. Just coach them.");

  return lines.join('\n');
}

export default function DashboardClient({ profile, thesis, syllabus }: DashboardClientProps) {
  const [citations, setCitations] = useState<GhostCitation[]>([]);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(
    (profile?.profile_data.recommended_session_length || 25) * 60,
  );
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [showBreakMessage, setShowBreakMessage] = useState(false);
  const [dashboardContext, setDashboardContext] = useState({
    profile,
    thesis,
    syllabus,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDashboardContext({ profile, thesis, syllabus });
    setPomodoroSeconds((profile?.profile_data.recommended_session_length || 25) * 60);
  }, [profile, thesis, syllabus]);

  useEffect(() => {
    const savedCitations = JSON.parse(localStorage.getItem('eden-citations') || '[]') as GhostCitation[];
    setCitations(savedCitations);
  }, []);

  useEffect(() => {
    if (!pomodoroRunning) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setPomodoroSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          setPomodoroRunning(false);
          setShowBreakMessage(true);
          window.setTimeout(() => setShowBreakMessage(false), 5000);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [pomodoroRunning]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const upcomingDeadlines = useMemo(() => {
    const weeks = dashboardContext.syllabus?.weeks || [];

    return weeks
      .filter((week) => week.deadline !== 'None')
      .map((week) => {
        const remaining = daysUntil(week.deadline);
        return remaining === null
          ? null
          : {
              name: week.assignments !== 'None' ? week.assignments : week.topic,
              daysRemaining: remaining,
              dateLabel: week.deadline,
            };
      })
      .filter((item): item is UpcomingDeadline => Boolean(item && item.daysRemaining >= 0))
      .sort((left, right) => left.daysRemaining - right.daysRemaining)
      .slice(0, 4);
  }, [dashboardContext.syllabus]);

  const thesisProgress = useMemo(() => {
    const sections = dashboardContext.thesis?.outline?.sections || [];
    const completed = sections.filter((section) => section.bullets.length > 0).length;

    return {
      completed,
      total: sections.length,
      percentage: sections.length ? Math.round((completed / sections.length) * 100) : 0,
    };
  }, [dashboardContext.thesis]);

  const systemPrompt = useMemo(
    () => buildSystemPrompt(dashboardContext.profile, upcomingDeadlines[0] || null, dashboardContext.thesis),
    [dashboardContext.profile, dashboardContext.thesis, upcomingDeadlines],
  );

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();

    if (!trimmed || chatLoading) {
      return;
    }

    const nextMessages = [...messages, { role: 'user' as const, content: trimmed }];
    setMessages(nextMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/study-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: nextMessages,
          systemPrompt,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'chat failed');
      }

      setMessages((previous) => [...previous, { role: 'assistant', content: data.reply || '' }]);
    } catch {
      setMessages((previous) => [
        ...previous,
        { role: 'assistant', content: 'Take the next smallest task, set a 15-minute timer, and start there.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="feature-page space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-white/20 bg-background p-3">
            <Sparkles size={32} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="page-header">Dashboard</h1>
            <p className="text-text-secondary">Your personalized Academic OS home screen</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="card xl:col-span-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="section-title">Today's Focus</h2>
              {dashboardContext.profile ? (
                <div className="mt-3 space-y-1 text-sm text-text-secondary">
                  <p>Your peak hours: {dashboardContext.profile.profile_data.peak_hours}</p>
                  <p>Technique: {dashboardContext.profile.profile_data.focus_technique}</p>
                </div>
              ) : (
                <Link href="/cognitive-compass" className="mt-3 inline-block text-sm text-emerald-400 hover:text-emerald-300">
                  Discover your focus style →
                </Link>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
              <p className="text-sm text-text-secondary">Pomodoro</p>
              <p className="text-3xl font-semibold text-[var(--text)]">{formatTimer(pomodoroSeconds)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => setPomodoroRunning(true)} className="btn btn-primary">
              Start
            </button>
            <button onClick={() => setPomodoroRunning(false)} className="btn btn-secondary">
              Pause
            </button>
            <button
              onClick={() => {
                setPomodoroRunning(false);
                setPomodoroSeconds((dashboardContext.profile?.profile_data.recommended_session_length || 25) * 60);
              }}
              className="btn btn-secondary"
            >
              Reset
            </button>
          </div>

          {showBreakMessage ? (
            <p className="mt-4 animate-pulse text-emerald-300">Break time! 🌿</p>
          ) : null}
        </div>

        <div className="card xl:col-span-5">
          <h2 className="section-title">Thesis Progress</h2>

          {dashboardContext.thesis ? (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)]">{dashboardContext.thesis.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {thesisProgress.completed} of {thesisProgress.total} sections expanded
                </p>
              </div>
              <div className="h-3 rounded-full bg-white/10">
                <div
                  className="h-3 rounded-full bg-emerald-600"
                  style={{ width: `${thesisProgress.percentage}%` }}
                />
              </div>
              <Link href="/thesis-sculptor" className="btn btn-primary inline-block">
                Continue Writing
              </Link>
            </div>
          ) : (
            <Link href="/thesis-sculptor" className="mt-4 inline-block text-sm text-emerald-400 hover:text-emerald-300">
              Start your first paper →
            </Link>
          )}
        </div>

        <div className="card xl:col-span-5">
          <h2 className="section-title">Upcoming Deadlines</h2>

          {upcomingDeadlines.length > 0 ? (
            <div className="mt-4 space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div
                  key={`${deadline.name}-${deadline.dateLabel}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-[var(--text)]">{deadline.name}</p>
                    <p className="text-sm text-text-secondary">{deadline.dateLabel}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${getDeadlineTone(deadline.daysRemaining)}`}>
                    {deadline.daysRemaining} days
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Link href="/syllabus-whisperer" className="mt-4 inline-block text-sm text-emerald-400 hover:text-emerald-300">
              Upload your syllabus →
            </Link>
          )}
        </div>

        <div className="card xl:col-span-7">
          <h2 className="section-title">Citation Vault</h2>

          <p className="mt-4 text-sm text-text-secondary">{citations.length} saved citations</p>

          <div className="mt-4 space-y-3">
            {citations.slice(0, 2).map((citation) => (
              <div key={citation.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="font-medium text-[var(--text)]">{citation.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{citation.authors}</p>
              </div>
            ))}
          </div>

          <Link href="/ghost-citations" className="btn btn-secondary mt-4 inline-block">
            Open full library
          </Link>
        </div>

        <div className="card xl:col-span-12">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
              <MessageSquare size={20} className="text-emerald-300" />
            </div>
            <div>
              <h2 className="section-title">AI Study Coach</h2>
              <p className="text-sm text-text-secondary">Context-aware coaching based on your profile, deadlines, and thesis work</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {PROMPT_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => void sendMessage(chip)}
                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/20"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="mt-5 max-h-96 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-text-secondary">Ask the study coach for a next step, a deadline breakdown, or a calm plan for today.</p>
            ) : null}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                ref={index === messages.length - 1 ? lastMessageRef : null}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 text-text-secondary'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {chatLoading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-text-secondary animate-pulse">...</div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex gap-3">
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void sendMessage(chatInput);
                }
              }}
              className="input"
              placeholder="Ask your study coach..."
            />
            <button
              onClick={() => void sendMessage(chatInput)}
              disabled={!chatInput.trim() || chatLoading}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              {chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
