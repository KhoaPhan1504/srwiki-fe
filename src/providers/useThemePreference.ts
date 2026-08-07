import { useTheme } from '~root/providers/ThemeProvider';
import { useUpdateSettings } from '~root/apis/useUpdateSettings';
import { Theme } from '~root/constants';

/**
 * Changes the theme locally (via ThemeProvider's context + localStorage) AND
 * persists it server-side (via PUT /settings) in one call.
 *
 * Both must happen together: AppShell reconciles `theme` from the server on
 * every mount and overwrites the local value if it differs, so a theme change
 * that only calls `setTheme` (local-only) gets silently reverted on next load.
 * Use this hook anywhere the user can change the theme (header ThemeToggle,
 * Settings > AppearanceTab) instead of calling `setTheme` directly.
 */
export const useThemePreference = () => {
  const { theme, setTheme } = useTheme();
  const { mutate: updateSettings } = useUpdateSettings();

  const setThemePreference = (next: Theme) => {
    setTheme(next);
    updateSettings({ theme: next });
  };

  return { theme, setThemePreference };
};
