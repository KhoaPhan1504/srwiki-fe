import { Theme } from '~root/constants';

const THEME_STORAGE_KEY = 'theme';

export const getSystemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;

export const applyTheme = (theme: Theme) => {
  const resolved = theme === Theme.SYSTEM ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', resolved === Theme.DARK);
};

export const readStoredTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === Theme.LIGHT || stored === Theme.DARK || stored === Theme.SYSTEM
    ? stored
    : Theme.SYSTEM;
};

export const storeTheme = (theme: Theme) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};
