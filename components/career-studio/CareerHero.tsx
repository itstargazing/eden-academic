'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';

type CareerHeroProps = {
  onStartBuilding: () => void;
  onTryInterview: () => void;
};

const nodes = [
  { label: 'Skills', x: '12%', y: '18%' },
  { label: 'Projects', x: '78%', y: '22%' },
  { label: 'Experience', x: '18%', y: '72%' },
  { label: 'Proof', x: '82%', y: '68%' },
  { label: 'Opportunities', x: '50%', y: '8%' },
];

export default function CareerHero({ onStartBuilding, onTryInterview }: CareerHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-panel)]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
        <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[var(--bg-hover)] blur-3xl" />
        <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-[var(--border)] blur-2xl" />
      </div>

      <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[var(--text-dim)]">
            <Sparkles size={14} className="text-[var(--text)]" />
            Eden Career Studio
          </p>
          <h1 className="font-[family-name:var(--font-unbounded)] text-3xl font-semibold leading-tight text-[var(--text)] sm:text-4xl">
            Build a resume that proves your story.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--text-dim)] sm:text-base">
            Eden turns your experience into a professional resume, adapts it for different roles, and prepares you for
            interviews based on your real background.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onStartBuilding}
              className="btn inline-flex items-center justify-center gap-2 border border-[var(--border)] bg-[var(--bg-hover)] px-5 py-2.5 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--bg)]"
            >
              Start Building
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={onTryInterview}
              className="text-sm font-medium text-[var(--text-dim)] underline decoration-[var(--border)] underline-offset-4 transition hover:text-[var(--text)]"
            >
              Try Interview Simulator
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mx-auto aspect-[4/3] w-full max-w-md"
        >
          <div className="absolute inset-0 rounded-lg border border-[var(--border)] bg-[var(--bg)] shadow-[0_0_0_1px_rgba(176,176,176,0.4)]">
            <div className="border-b border-[var(--border)] px-4 py-2 text-[10px] uppercase tracking-widest text-[var(--text-ghost)]">
              preview · live structure
            </div>
            <div className="space-y-2 p-4 text-left text-xs text-[var(--text-dim)]">
              <div className="h-2 w-[66%] rounded bg-[var(--bg-hover)]" />
              <div className="h-2 w-full rounded bg-[var(--bg-panel)]" />
              <div className="h-2 w-[83%] rounded bg-[var(--bg-panel)]" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="h-16 rounded border border-dashed border-[var(--border)] bg-[var(--bg-panel)]" />
                <div className="h-16 rounded border border-dashed border-[var(--border)] bg-[var(--bg-panel)]" />
              </div>
            </div>
            {nodes.map((node, i) => (
              <motion.span
                key={node.label}
                className="absolute flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[10px] font-medium text-[var(--text)] shadow-sm"
                style={{ left: node.x, top: node.y }}
                animate={{ boxShadow: ['0 0 0 0 rgba(68,68,68,0)', '0 0 20px 2px rgba(176,176,176,0.6)', '0 0 0 0 rgba(68,68,68,0)'] }}
                transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.35 }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-dim)]" />
                {node.label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
