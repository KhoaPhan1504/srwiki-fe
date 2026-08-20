import i18n from '~root/i18n';
import { getIntlLocaleTag } from '~root/i18n/dateLocale';
import type { Language } from '~root/constants';

export * from './uuid-generator';
export * from './json-formatter';
export * from './admin-members';
export * from './fuzzy-match';
export * from './date-format';
export * from './regex-tester';
export * from './markdown-preview';
export * from './base64-encoder-decoder';
export * from './url-encoder-decoder';

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

export const getInitials = (fullName?: string | null, email?: string | null): string =>
  (fullName || email || '?').slice(0, 1).toUpperCase();

export const formatDuration = (totalSeconds: number): string => {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};
