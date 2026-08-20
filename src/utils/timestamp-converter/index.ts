import { ErrorCodes, TimestampUnit } from '~root/constants';
import type { TimezoneMode } from '~root/constants';
import type {
  DateToTimestampResult,
  TimestampConverterError,
  TimestampToDateResult,
} from '~root/types';

const MS_PER_SECOND = 1000;

const emptyInputError = (): TimestampConverterError => ({
  code: ErrorCodes.EMPTY_INPUT,
  message: '',
});

const NUMERIC_TIMESTAMP_PATTERN = /^-?\d+(\.\d+)?$/;

export const convertTimestampToDate = (
  input: string,
  unit: TimestampUnit,
): TimestampToDateResult => {
  const trimmed = input.trim();
  if (!trimmed) return { success: false, error: emptyInputError() };

  if (!NUMERIC_TIMESTAMP_PATTERN.test(trimmed)) {
    return {
      success: false,
      error: { code: ErrorCodes.INVALID_TIMESTAMP, message: 'Not a valid number' },
    };
  }

  const value = Number(trimmed);
  const milliseconds =
    unit === TimestampUnit.SECONDS ? Math.round(value * MS_PER_SECOND) : Math.round(value);
  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    return {
      success: false,
      error: { code: ErrorCodes.INVALID_TIMESTAMP, message: 'Timestamp is out of range' },
    };
  }

  return { success: true, date, milliseconds };
};

const DATE_INPUT_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?(Z|[+-]\d{2}:?\d{2})?$/;

const daysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

const isValidCalendarDate = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
): boolean => {
  if (month < 1 || month > 12) return false;
  if (hour > 23 || minute > 59 || second > 59) return false;
  return day >= 1 && day <= daysInMonth(year, month);
};

const parseDateInput = (input: string, timezoneMode: TimezoneMode): Date | undefined => {
  const match = DATE_INPUT_PATTERN.exec(input);
  if (!match) return undefined;

  const [, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr, msStr, offset] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const hour = Number(hourStr ?? '0');
  const minute = Number(minuteStr ?? '0');
  const second = Number(secondStr ?? '0');
  const milliseconds = msStr ? Number(msStr.padEnd(3, '0')) : 0;

  if (!isValidCalendarDate(year, month, day, hour, minute, second)) return undefined;

  if (offset) {
    return new Date(input.replace(' ', 'T'));
  }

  return timezoneMode === 'UTC'
    ? new Date(Date.UTC(year, month - 1, day, hour, minute, second, milliseconds))
    : new Date(year, month - 1, day, hour, minute, second, milliseconds);
};

export const convertDateToTimestamp = (
  input: string,
  timezoneMode: TimezoneMode,
): DateToTimestampResult => {
  const trimmed = input.trim();
  if (!trimmed) return { success: false, error: emptyInputError() };

  const date = parseDateInput(trimmed, timezoneMode);
  if (!date || Number.isNaN(date.getTime())) {
    return {
      success: false,
      error: { code: ErrorCodes.INVALID_DATE, message: 'Not a recognized date/time format' },
    };
  }

  const milliseconds = date.getTime();
  return { success: true, seconds: Math.floor(milliseconds / MS_PER_SECOND), milliseconds };
};
