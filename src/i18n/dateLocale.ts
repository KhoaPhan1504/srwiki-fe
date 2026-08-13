import { vi, enUS } from 'date-fns/locale';
import { Language } from '~root/constants';

export const getDateFnsLocale = (lang: Language) => (lang === Language.EN ? enUS : vi);

export const getIntlLocaleTag = (lang: Language): string =>
  lang === Language.EN ? 'en-US' : 'vi-VN';
