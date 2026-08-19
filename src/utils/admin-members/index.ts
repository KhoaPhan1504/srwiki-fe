import type { FilterValue } from '~root/components/ui';
import { TIMEZONES } from '~root/constants';
import type { TimezoneMode } from '~root/constants';

const parseDateOnly = (value: string): [number, number, number] | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
};

export const toCreatedAtFromIso = (
  value: string,
  timezoneMode: TimezoneMode,
): string | undefined => {
  const parts = parseDateOnly(value);
  if (!parts) return undefined;
  const [year, month, day] = parts;
  const date =
    timezoneMode === 'UTC'
      ? new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
      : new Date(year, month, day, 0, 0, 0, 0);
  return date.toISOString();
};

export const toCreatedAtToIso = (value: string, timezoneMode: TimezoneMode): string | undefined => {
  const parts = parseDateOnly(value);
  if (!parts) return undefined;
  const [year, month, day] = parts;
  const date =
    timezoneMode === 'UTC'
      ? new Date(Date.UTC(year, month, day, 23, 59, 59, 999))
      : new Date(year, month, day, 23, 59, 59, 999);
  return date.toISOString();
};

export const dateOnly = (date?: Date): string | undefined => date?.toISOString().slice(0, 10);

export const asDateRange = (value: FilterValue | undefined): { from?: Date; to?: Date } =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export const resolveLocalTimezone = (): string => {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (TIMEZONES as readonly string[]).includes(detected) ? detected : 'Asia/Ho_Chi_Minh';
};
