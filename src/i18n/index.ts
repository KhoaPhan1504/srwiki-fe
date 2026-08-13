import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Language } from '~root/constants';
import { readStoredLanguage } from '~root/providers/language';

import viCommon from './vi/common.json';
import enCommon from './en/common.json';
import viHeader from './vi/header.json';
import enHeader from './en/header.json';
import viCommandPalette from './vi/command-palette.json';
import enCommandPalette from './en/command-palette.json';
import viAuth from './vi/auth.json';
import enAuth from './en/auth.json';

export const NAMESPACES = ['common', 'header', 'command-palette', 'auth'] as const;

const resources = {
  [Language.VI]: {
    common: viCommon,
    header: viHeader,
    'command-palette': viCommandPalette,
    auth: viAuth,
  },
  [Language.EN]: {
    common: enCommon,
    header: enHeader,
    'command-palette': enCommandPalette,
    auth: enAuth,
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
});

export default i18n;
