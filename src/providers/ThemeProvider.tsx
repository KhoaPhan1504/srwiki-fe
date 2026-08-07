import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Theme } from '~root/constants';
import { applyTheme, readStoredTheme, storeTheme } from '~root/providers/theme';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== Theme.SYSTEM) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyTheme(Theme.SYSTEM);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (next: Theme) => {
    storeTheme(next);
    setThemeState(next);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
