import type { ErrorCodes } from '~root/constants';

export type TimestampConverterError = { code: ErrorCodes; message: string };

export type TimestampToDateResult =
  | { success: true; date: Date; milliseconds: number }
  | { success: false; error: TimestampConverterError };

export type DateToTimestampResult =
  | { success: true; seconds: number; milliseconds: number }
  | { success: false; error: TimestampConverterError };
