import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  largeText: boolean;
  setLargeText: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = 'medpal_theme_mode';
const TEXT_SCALE_KEY = 'medpal_large_text';

function getSystemPrefersDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'system';
    } catch {
      return 'system';
    }
  });

  const [largeText, setLargeTextState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TEXT_SCALE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    mode === 'dark' ? 'dark' : mode === 'light' ? 'light' : (getSystemPrefersDark() ? 'dark' : 'light')
  );

  useEffect(() => {
    const apply = () => {
      const resolved = mode === 'system' ? (getSystemPrefersDark() ? 'dark' : 'light') : mode;
      setResolvedTheme(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
    };
    apply();

    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => apply();
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-text-scale', largeText ? 'large' : 'normal');
    try { localStorage.setItem(TEXT_SCALE_KEY, String(largeText)); } catch { /* ignore */ }
  }, [largeText]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
  };

  const setLargeText = (v: boolean) => setLargeTextState(v);

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode, largeText, setLargeText }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- same co-located hook+provider pattern as AuthContext.tsx
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
