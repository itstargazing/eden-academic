"use client";

import { signIn } from 'next-auth/react';
import Image from 'next/image';

export function AuthButtons() {
  return (
    <div className="space-y-4">
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="flex items-center justify-center gap-3 w-full px-4 py-2.5 border border-[var(--border)] bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] text-[var(--text)] font-medium rounded-lg transition-colors"
      >
        <Image
          src="/images/google.svg"
          alt="Google"
          width={20}
          height={20}
        />
        Continue with Google
      </button>
    </div>
  );
} 