'use client';

import { motion } from 'framer-motion';
import type { StudioStep } from '@/lib/career-studio/careerTypes';

const STEPS: { step: StudioStep; label: string }[] = [
  { step: 1, label: 'Add info' },
  { step: 2, label: 'Resume' },
  { step: 3, label: 'Proof' },
  { step: 4, label: 'Persona' },
  { step: 5, label: 'Interview' },
  { step: 6, label: 'Match' },
];

type Props = {
  current: StudioStep;
  onSelect?: (step: StudioStep) => void;
};

export default function CareerProgressSteps({ current, onSelect }: Props) {
  return (
    <nav aria-label="Career studio progress" className="w-full overflow-x-auto border-b border-[var(--border)] pb-3">
      <ol className="flex min-w-[520px] items-stretch justify-between gap-2 sm:min-w-0">
        {STEPS.map(({ step, label }) => {
          const active = current === step;
          const done = current > step;
          return (
            <li key={step} className="flex-1">
              <button
                type="button"
                disabled={!onSelect}
                onClick={() => onSelect?.(step)}
                className={`flex w-full flex-col items-center gap-1 rounded-md border px-1 py-2 text-center transition ${
                  active
                    ? 'border-[var(--text)] bg-[var(--bg-hover)]'
                    : done
                      ? 'border-[var(--border)] bg-[var(--bg-panel)]'
                      : 'border-[var(--border)] bg-[var(--bg)]'
                } ${onSelect ? 'cursor-pointer' : 'cursor-default'} hover:border-[var(--text-dim)]`}
              >
                <span className={`text-[10px] font-semibold ${active ? 'text-[var(--text)]' : 'text-[var(--text-dim)]'}`}>{step}</span>
                <motion.span
                  className="hidden text-[9px] uppercase tracking-wider text-[var(--text-dim)] sm:block"
                  animate={{ opacity: active ? 1 : 0.75 }}
                >
                  {label}
                </motion.span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
