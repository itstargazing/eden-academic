'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Read saved theme once on client — keep the same Provider wrapper so children never remount.
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('eden-theme');
      if (isTheme(saved)) {
        setThemeState(saved);
      }
    } catch {
      // private mode / blocked storage
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    try {
      localStorage.setItem('eden-theme', theme);
    } catch {
      // ignore
    }

    if (theme === 'light') {
      root.style.setProperty('--background', '#ebebeb');
      root.style.setProperty('--background-light', '#f5f5f5');
      root.style.setProperty('--primary', '#ebebeb');
      root.style.setProperty('--primary-light', '#dedede');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#4b5563');
    } else {
      root.style.setProperty('--background', '#ebebeb');
      root.style.setProperty('--background-light', '#f5f5f5');
      root.style.setProperty('--primary', '#ebebeb');
      root.style.setProperty('--primary-light', '#dedede');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#4b5563');
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
