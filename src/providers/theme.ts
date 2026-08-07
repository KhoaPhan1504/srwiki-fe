export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'theme';

export const getSystemTheme = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const applyTheme = (theme: Theme) => {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
};

export const readStoredTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
};

export const storeTheme = (theme: Theme) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};
