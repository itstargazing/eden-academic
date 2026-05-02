import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface IntroductionProps {
  onComplete: () => void;
}

export default function Introduction({ onComplete }: IntroductionProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4"
      style={{ background: '#ebebeb', color: '#0a0a0a' }}
    >
      <div className="w-full max-w-3xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
        >
          <p className="mb-4 font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[var(--text-ghost)]">
            EDEN protocol initialized
          </p>
          <h1 className="font-unbounded text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6" style={{ color: '#0a0a0a' }}>
            Welcome to EDEN
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg lg:text-xl mb-10 sm:mb-12" style={{ color: '#444444', fontFamily: 'JetBrains Mono' }}>
            Your Educational Development Environment
          </p>
          <button
            onClick={onComplete}
            className="font-unbounded group inline-flex items-center gap-2 text-base sm:text-lg transition-colors duration-300"
            style={{
              background: 'var(--bg-panel)',
              color: 'var(--text)',
              padding: '0.75rem 2rem',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            DISCOVER EDEN
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-6 font-mono text-sm text-[var(--text-dim)]">
            The full system map is waiting on the homepage.
          </p>
        </motion.div>
      </div>
    </div>
  );
} 