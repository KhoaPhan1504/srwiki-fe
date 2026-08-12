import { Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Theme } from '~root/constants';

export type PaletteCommand = {
  id: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
};

export const getThemeCommands = (setThemePreference: (theme: Theme) => void): PaletteCommand[] => [
  {
    id: 'theme-light',
    label: 'Chuyển sang giao diện Sáng',
    icon: Sun,
    run: () => setThemePreference(Theme.LIGHT),
  },
  {
    id: 'theme-dark',
    label: 'Chuyển sang giao diện Tối',
    icon: Moon,
    run: () => setThemePreference(Theme.DARK),
  },
  {
    id: 'theme-system',
    label: 'Chuyển theo hệ thống',
    icon: Monitor,
    run: () => setThemePreference(Theme.SYSTEM),
  },
];
