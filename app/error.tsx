'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center font-mono">
      <h1 className="text-lg font-semibold text-[var(--text)]">Something went wrong</h1>
      <p className="text-sm text-[var(--text-dim)]">{error.message || 'Unknown error'}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md border border-[var(--border)] bg-[var(--bg-panel)] px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg-hover)]"
      >
        Try again
      </button>
      <p className="text-xs text-[var(--text-ghost)]">
        If the dev server shows a missing <code className="text-[var(--text-dim)]">.js</code> chunk, run{' '}
        <code className="text-[var(--text-dim)]">npm run clean</code> then <code className="text-[var(--text-dim)]">npm run dev</code>.
      </p>
    </div>
  );
}
