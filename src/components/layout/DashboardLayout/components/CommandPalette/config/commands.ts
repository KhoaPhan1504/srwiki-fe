import { Languages, Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TFunction } from 'i18next';
import { Language, Theme } from '~root/constants';

export type PaletteCommand = {
  id: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
};

export const getThemeCommands = (
  t: TFunction,
  setThemePreference: (theme: Theme) => void,
): PaletteCommand[] => [
  {
    id: 'theme-light',
    label: t('commands.themeLight'),
    icon: Sun,
    run: () => setThemePreference(Theme.LIGHT),
  },
  {
    id: 'theme-dark',
    label: t('commands.themeDark'),
    icon: Moon,
    run: () => setThemePreference(Theme.DARK),
  },
  {
    id: 'theme-system',
    label: t('commands.themeSystem'),
    icon: Monitor,
    run: () => setThemePreference(Theme.SYSTEM),
  },
];

export const getLanguageCommands = (
  t: TFunction,
  setLanguagePreference: (lang: Language) => void,
): PaletteCommand[] => [
  {
    id: 'language-vi',
    label: t('commands.languageVi'),
    icon: Languages,
    run: () => setLanguagePreference(Language.VI),
  },
  {
    id: 'language-en',
    label: t('commands.languageEn'),
    icon: Languages,
    run: () => setLanguagePreference(Language.EN),
  },
];
