import { toast } from 'react-toastify';
import { useTheme } from '~root/providers/ThemeProvider';
import type { Theme } from '~root/providers/ThemeProvider';
import { useUpdateSettings } from '~root/apis/useUpdateSettings';

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
    updateSettings(
      { theme: next },
      { onError: () => toast.error('Lưu giao diện thất bại.', { position: 'bottom-center' }) },
    );
  };

  return { theme, setThemePreference };
};
