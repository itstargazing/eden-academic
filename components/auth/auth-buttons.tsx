"use client";

import { signIn } from 'next-auth/react';
import Image from 'next/image';

export function AuthButtons() {
  return (
    <div className="space-y-4">
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="flex items-center justify-center gap-3 w-full px-4 py-2.5 bg-white hover:bg-white/90 text-black font-medium rounded-lg transition-colors"
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