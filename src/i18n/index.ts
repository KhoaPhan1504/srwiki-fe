import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Language } from '~root/constants';
import { readStoredLanguage } from '~root/providers/language';

import viCommon from './vi/common.json';
import enCommon from './en/common.json';

export const NAMESPACES = ['common'] as const;

const resources = {
  [Language.VI]: { common: viCommon },
  [Language.EN]: { common: enCommon },
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
