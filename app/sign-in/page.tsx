'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const nextPath = searchParams.get('next') || '/dashboard';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState<'google' | 'email' | ''>('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setError('Supabase is not configured yet.');
      return;
    }

    setLoading('google');
    setError('');
    setMessage('');

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${nextPath}`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading('');
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!supabase) {
      setError('Supabase is not configured yet.');
      return;
    }

    setLoading('email');
    setError('');
    setMessage('');

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${nextPath}`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading('');
      return;
    }

    setMessage('Check your inbox for a sign-in link.');
    setLoading('');
  };

  return (
    <div className="feature-page mx-auto flex min-h-[80vh] max-w-xl items-center justify-center px-4">
      <div className="card w-full space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">EDEN</p>
          <h1 className="page-header">Sign in to your Academic OS</h1>
          <p className="text-text-secondary">
            Use Google or a magic link to unlock saved profiles, thesis drafts, and your dashboard.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </div>
        ) : null}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading !== ''}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-4 py-3 font-medium text-[var(--text)] transition hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === 'google' ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          Continue with Google
        </button>

        <div className="space-y-3">
          <label htmlFor="email" className="block text-sm font-medium text-[var(--text)]">
            Or send a magic link
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@university.edu"
            className="input"
          />
          <button
            onClick={handleMagicLink}
            disabled={loading !== ''}
            className="btn btn-secondary flex w-full items-center justify-center gap-2"
          >
            {loading === 'email' ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
            Send magic link
          </button>
        </div>

        <button
          onClick={() => router.push('/')}
          className="text-sm text-text-secondary transition hover:text-[var(--text)]"
        >
          Back to EDEN
        </button>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="feature-page flex min-h-[80vh] items-center justify-center px-4 text-sm text-[var(--text-dim)]">
          Loading sign-in…
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
