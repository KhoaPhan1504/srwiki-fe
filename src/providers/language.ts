import { Language } from '~root/constants';

const LANGUAGE_STORAGE_KEY = 'language';

export const readStoredLanguage = (): Language => {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === Language.VI || stored === Language.EN ? stored : Language.VI;
};

export const storeLanguage = (lang: Language) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
};
