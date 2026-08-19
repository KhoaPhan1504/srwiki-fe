import i18n from '~root/i18n';
import { getIntlLocaleTag } from '~root/i18n/dateLocale';
import type { Language } from '~root/constants';

export * from './uuid-generator';

export const isJsonString = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat(getIntlLocaleTag(i18n.language as Language), {
    dateStyle: 'long',
  }).format(typeof value === 'string' ? new Date(value) : value);

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'SUPERADMIN',
  admin: 'ADMIN',
  member: 'MEMBER',
};

export const getRoleLabel = (role?: string | null): string => {
  if (!role) return '';
  return ROLE_LABELS[role] ?? role.toUpperCase().replace(/_/g, '');
};
