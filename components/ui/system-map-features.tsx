'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

type FeatureNode = {
  id: string;
  name: string;
  description: string;
  href: string;
  command: string;
};

const FEATURES: FeatureNode[] = [
  { id: '01', name: 'BrainMerge', description: 'Find research collaborators matched to your academic interests.', href: '/brain-merge', command: 'brainmerge' },
  { id: '02', name: 'ThesisSculptor', description: 'AI-guided outline builder for research papers and dissertations.', href: '/thesis-sculptor', command: 'thesissculptor' },
  { id: '03', name: 'MindMap Translator', description: 'Convert notes and documents into structured visual mind maps.', href: '/mindmap-translator', command: 'mindmap' },
  { id: '04', name: 'StudyTime Synch', description: 'Smart scheduling that adapts to your deadlines and energy levels.', href: '/studytime-synch', command: 'studytime' },
  { id: '05', name: 'GhostCitations', description: 'Recover half-remembered references and format them instantly.', href: '/ghost-citations', command: 'ghostcite' },
  { id: '06', name: 'Syllabus Whisperer', description: 'Upload any syllabus and get a clean deadline timeline in seconds.', href: '/syllabus-whisperer', command: 'syllabus' },
  { id: '07', name: 'Cognitive Compass', description: 'Discover your focus profile and get a personalized study strategy.', href: '/cognitive-compass', command: 'compass' },
  { id: '08', name: 'Stress Alchemist', description: 'Turn academic pressure into structured action plans.', href: '/stress-alchemist', command: 'alchemist' },
  { id: '09', name: 'Focus Soundscapes', description: 'Custom ambient audio mixes engineered for deep study sessions.', href: '/focus-soundscapes', command: 'soundscape' },
];

export default function SystemMapFeatures() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border border-[var(--border)] bg-[var(--bg)] px-4 py-16 sm:px-6 lg:px-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(rgba(176,176,176,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(176,176,176,0.22) 1px, transparent 1px)',
          backgroundSize: '62px 62px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(176,176,176,0.18), transparent 32%), radial-gradient(circle at 80% 0%, rgba(68,68,68,0.08), transparent 28%), linear-gradient(180deg, rgba(235,235,235,0.35), rgba(235,235,235,0.88))',
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-2xl space-y-4">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[var(--text-ghost)]">
            EDEN system map // core tools
          </p>
          <h2 className="font-unbounded text-3xl leading-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
            A connected academic operating system.
          </h2>
          <p className="max-w-xl font-mono text-sm leading-7 text-[var(--text-dim)] sm:text-[0.95rem]">
            Each node opens a focused tool in the EDEN network. The sequence is built to feel like an AI pipeline:
            structured, deliberate, and easy to navigate.
          </p>
        </div>

        <div className="relative mt-16">
          <div className="pointer-events-none absolute bottom-0 left-7 top-4 w-px bg-[rgba(176,176,176,0.8)] md:left-1/2 md:-translate-x-1/2" />

          {FEATURES.map((feature, index) => {
            const isLeft = index % 2 === 0;
            const isLast = index === FEATURES.length - 1;

            return (
              <div key={feature.id} className="relative pb-14 last:pb-0 md:pb-16">
                {!isLast ? (
                  <motion.div
                    initial={prefersReducedMotion ? false : { scaleY: 0, opacity: 0.35 }}
                    whileInView={prefersReducedMotion ? {} : { scaleY: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
                    className="pointer-events-none absolute left-7 top-14 h-[calc(100%-0.25rem)] w-px origin-top bg-[rgba(68,68,68,0.42)] md:left-1/2 md:-translate-x-1/2"
                  />
                ) : null}

                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 24, x: isLeft ? -16 : 16 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0, x: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="relative md:grid md:grid-cols-2"
                >
                  <Link
                    href={feature.href}
                    className={`group relative block pl-20 md:pl-0 ${
                      isLeft ? 'md:col-start-1 md:pr-24 md:text-right' : 'md:col-start-2 md:pl-24'
                    }`}
                  >
                    <motion.div
                      whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.03 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className={`absolute left-7 top-0 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-[var(--text)] bg-[var(--bg-panel)] shadow-[0_0_0_6px_rgba(235,235,235,0.96)] transition-shadow duration-200 group-hover:shadow-[0_0_0_6px_rgba(235,235,235,0.96),0_0_26px_rgba(10,10,10,0.08)] ${
                        isLeft
                          ? 'md:left-auto md:right-0 md:translate-x-1/2'
                          : 'md:left-0 md:-translate-x-1/2'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] font-mono text-xs tracking-[0.22em] text-[var(--text)]">
                        {feature.id}
                      </div>
                    </motion.div>

                    <div
                      className={`space-y-3 ${
                        isLeft
                          ? 'border-l border-[rgba(176,176,176,0.75)] pl-5 md:border-l-0 md:border-r md:pr-6 md:pl-0'
                          : 'border-l border-[rgba(176,176,176,0.75)] pl-5 md:pl-6'
                      }`}
                    >
                      <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-[var(--text-ghost)]">
                        run {feature.command}
                      </p>
                      <h3 className="font-unbounded text-xl leading-tight text-[var(--text)] transition-transform duration-200 group-hover:translate-y-[-1px] sm:text-2xl">
                        {feature.name}
                      </h3>
                      <p className="max-w-sm font-mono text-sm leading-7 text-[var(--text-dim)] md:max-w-none">
                        {feature.description}
                      </p>
                      <span className="inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--text-dim)] transition-colors group-hover:text-[var(--text)]">
                        Open tool
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
