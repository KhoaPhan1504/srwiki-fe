import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Language } from '~root/constants';
import { readStoredLanguage, storeLanguage } from '~root/providers/language';

import viCommon from './vi/common.json';
import enCommon from './en/common.json';
import viHeader from './vi/header.json';
import enHeader from './en/header.json';
import viCommandPalette from './vi/command-palette.json';
import enCommandPalette from './en/command-palette.json';
import viAuth from './vi/auth.json';
import enAuth from './en/auth.json';
import viDashboard from './vi/dashboard.json';
import enDashboard from './en/dashboard.json';
import viProfile from './vi/profile.json';
import enProfile from './en/profile.json';
import viSettingsGeneral from './vi/settings-general.json';
import enSettingsGeneral from './en/settings-general.json';
import viSettingsAppearance from './vi/settings-appearance.json';
import enSettingsAppearance from './en/settings-appearance.json';
import viSettingsNotifications from './vi/settings-notifications.json';
import enSettingsNotifications from './en/settings-notifications.json';
import viSettingsAccount from './vi/settings-account.json';
import enSettingsAccount from './en/settings-account.json';
import viNotifications from './vi/notifications.json';
import enNotifications from './en/notifications.json';
import viForms from './vi/forms.json';
import enForms from './en/forms.json';

export const NAMESPACES = [
  'common',
  'header',
  'command-palette',
  'auth',
  'dashboard',
  'profile',
  'settings-general',
  'settings-appearance',
  'settings-notifications',
  'settings-account',
  'notifications',
  'forms',
] as const;

const resources = {
  [Language.VI]: {
    common: viCommon,
    header: viHeader,
    'command-palette': viCommandPalette,
    auth: viAuth,
    dashboard: viDashboard,
    profile: viProfile,
    'settings-general': viSettingsGeneral,
    'settings-appearance': viSettingsAppearance,
    'settings-notifications': viSettingsNotifications,
    'settings-account': viSettingsAccount,
    notifications: viNotifications,
    forms: viForms,
  },
  [Language.EN]: {
    common: enCommon,
    header: enHeader,
    'command-palette': enCommandPalette,
    auth: enAuth,
    dashboard: enDashboard,
    profile: enProfile,
    'settings-general': enSettingsGeneral,
    'settings-appearance': enSettingsAppearance,
    'settings-notifications': enSettingsNotifications,
    'settings-account': enSettingsAccount,
    notifications: enNotifications,
    forms: enForms,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: readStoredLanguage(),
  fallbackLng: Language.VI,
  defaultNS: 'common',
  ns: NAMESPACES,
  interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  storeLanguage(lng as Language);
});

export default i18n;
