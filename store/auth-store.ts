import { create } from 'zustand';
import { signIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  signIn: async (provider: string) => {
    try {
      set({ isLoading: true, error: null });
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      set({ error: 'Failed to sign in. Please try again.' });
    } finally {
      set({ isLoading: false });
    }
  },
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      await nextAuthSignOut({ callbackUrl: '/' });
      set({ user: null });
    } catch (error) {
      set({ error: 'Failed to sign out. Please try again.' });
    } finally {
      set({ isLoading: false });
    }
  },
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
})); 