'use client';

import Link from 'next/link';
import { useSupabaseUser } from '@/hooks/use-supabase-user';

export default function SaveResultsBanner() {
  const { user, loading } = useSupabaseUser();

  if (loading || user) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-4 py-3 text-sm text-text-secondary">
      Sign in to save your results.{' '}
      <Link href="/sign-in" className="text-[var(--text)] underline transition hover:text-[var(--text-dim)]">
        Go to sign in
      </Link>
    </div>
  );
}
