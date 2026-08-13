import { useTranslation } from 'react-i18next';
import { useUpdateSettings } from '~root/apis/useUpdateSettings';
import { storeLanguage } from '~root/providers/language';
import { Language } from '~root/constants';

export const useLanguagePreference = () => {
  const { i18n } = useTranslation();
  const { mutate: updateSettings } = useUpdateSettings();

  const setLanguagePreference = (next: Language) => {
    i18n.changeLanguage(next);
    storeLanguage(next);
    updateSettings({ language: next });
  };

  return { language: i18n.language as Language, setLanguagePreference };
};
