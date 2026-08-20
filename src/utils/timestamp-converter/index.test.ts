import { describe, expect, it } from 'vitest';
import { TimestampUnit } from '~root/constants';
import { convertDateToTimestamp, convertTimestampToDate } from '.';

describe('convertTimestampToDate', () => {
  it('returns EMPTY_INPUT for an empty string', () => {
    const result = convertTimestampToDate('', TimestampUnit.SECONDS);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('EMPTY_INPUT');
  });

  it('returns EMPTY_INPUT for whitespace-only input', () => {
    const result = convertTimestampToDate('   ', TimestampUnit.SECONDS);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('EMPTY_INPUT');
  });

  it('converts 0 seconds to the Unix epoch', () => {
    const result = convertTimestampToDate('0', TimestampUnit.SECONDS);
    expect(result).toEqual({ success: true, date: new Date(0), milliseconds: 0 });
  });

  it('converts a positive seconds timestamp', () => {
    const result = convertTimestampToDate('1700000000', TimestampUnit.SECONDS);
    expect(result).toEqual({
      success: true,
      date: new Date(1700000000 * 1000),
      milliseconds: 1700000000000,
    });
  });

  it('converts a positive milliseconds timestamp', () => {
    const result = convertTimestampToDate('1700000000123', TimestampUnit.MILLISECONDS);
    expect(result).toEqual({
      success: true,
      date: new Date(1700000000123),
      milliseconds: 1700000000123,
    });
  });

  it('converts a negative timestamp (before the Unix epoch)', () => {
    const result = convertTimestampToDate('-86400', TimestampUnit.SECONDS);
    expect(result).toEqual({
      success: true,
      date: new Date(-86400 * 1000),
      milliseconds: -86400000,
    });
  });

  it('accepts a decimal seconds value', () => {
    const result = convertTimestampToDate('1700000000.5', TimestampUnit.SECONDS);
    expect(result).toEqual({
      success: true,
      date: new Date(1700000000500),
      milliseconds: 1700000000500,
    });
  });

  it('rejects non-numeric input', () => {
    const result = convertTimestampToDate('not-a-timestamp', TimestampUnit.SECONDS);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_TIMESTAMP');
  });

  it('rejects scientific notation', () => {
    const result = convertTimestampToDate('1e10', TimestampUnit.SECONDS);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_TIMESTAMP');
  });

  it('rejects a timestamp far outside the representable Date range', () => {
    const result = convertTimestampToDate('999999999999999999', TimestampUnit.SECONDS);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_TIMESTAMP');
  });
});

describe('convertDateToTimestamp', () => {
  it('returns EMPTY_INPUT for an empty string', () => {
    const result = convertDateToTimestamp('', 'local');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('EMPTY_INPUT');
  });

  it('parses a date-only ISO string in UTC mode', () => {
    const result = convertDateToTimestamp('2024-01-15', 'UTC');
    const expected = Date.UTC(2024, 0, 15);
    expect(result).toEqual({
      success: true,
      seconds: expected / 1000,
      milliseconds: expected,
    });
  });

  it('parses a date-only ISO string in local mode', () => {
    const result = convertDateToTimestamp('2024-01-15', 'local');
    const expected = new Date(2024, 0, 15).getTime();
    expect(result).toEqual({
      success: true,
      seconds: Math.floor(expected / 1000),
      milliseconds: expected,
    });
  });

  it('parses a full date-time string with T separator in local mode', () => {
    const result = convertDateToTimestamp('2024-01-15T10:30:00', 'local');
    const expected = new Date(2024, 0, 15, 10, 30, 0).getTime();
    expect(result).toEqual({
      success: true,
      seconds: Math.floor(expected / 1000),
      milliseconds: expected,
    });
  });

  it('parses a date-time string with a space separator, matching T behavior', () => {
    const result = convertDateToTimestamp('2024-01-15 10:30:00', 'UTC');
    const expected = Date.UTC(2024, 0, 15, 10, 30, 0);
    expect(result).toEqual({ success: true, seconds: expected / 1000, milliseconds: expected });
  });

  it('parses milliseconds precision', () => {
    const result = convertDateToTimestamp('2024-01-15T10:30:00.250', 'UTC');
    const expected = Date.UTC(2024, 0, 15, 10, 30, 0, 250);
    expect(result).toEqual({
      success: true,
      seconds: Math.floor(expected / 1000),
      milliseconds: expected,
    });
  });

  it('respects an explicit Z (UTC) offset regardless of the timezone toggle', () => {
    const result = convertDateToTimestamp('2024-01-15T10:30:00Z', 'local');
    const expected = Date.UTC(2024, 0, 15, 10, 30, 0);
    expect(result).toEqual({ success: true, seconds: expected / 1000, milliseconds: expected });
  });

  it('respects an explicit +HH:MM offset regardless of the timezone toggle', () => {
    const result = convertDateToTimestamp('2024-01-15T10:30:00+07:00', 'UTC');
    const expected = Date.UTC(2024, 0, 15, 3, 30, 0);
    expect(result).toEqual({ success: true, seconds: expected / 1000, milliseconds: expected });
  });

  it('respects an explicit -HHMM (no colon) offset', () => {
    const result = convertDateToTimestamp('2024-01-15T10:30:00-0500', 'UTC');
    const expected = Date.UTC(2024, 0, 15, 15, 30, 0);
    expect(result).toEqual({ success: true, seconds: expected / 1000, milliseconds: expected });
  });

  it('parses a date before the Unix epoch', () => {
    const result = convertDateToTimestamp('1969-12-31T00:00:00Z', 'UTC');
    const expected = Date.UTC(1969, 11, 31);
    expect(result).toEqual({ success: true, seconds: expected / 1000, milliseconds: expected });
  });

  it('accepts Feb 29 on a leap year', () => {
    const result = convertDateToTimestamp('2024-02-29', 'UTC');
    expect(result.success).toBe(true);
  });

  it('rejects Feb 29 on a non-leap year', () => {
    const result = convertDateToTimestamp('2023-02-29', 'UTC');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_DATE');
  });

  it('rejects an out-of-range month', () => {
    const result = convertDateToTimestamp('2024-13-01', 'UTC');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_DATE');
  });

  it('rejects an out-of-range day', () => {
    const result = convertDateToTimestamp('2024-04-31', 'UTC');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_DATE');
  });

  it('rejects a completely unrecognized string', () => {
    const result = convertDateToTimestamp('not a date', 'UTC');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_DATE');
  });

  it('rejects a malformed offset', () => {
    const result = convertDateToTimestamp('2024-01-15T10:30:00+7', 'UTC');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_DATE');
  });
});

describe('round-trip', () => {
  it('is the inverse of convertTimestampToDate for a UTC ISO string', () => {
    const toDate = convertTimestampToDate('1700000000', TimestampUnit.SECONDS);
    expect(toDate.success).toBe(true);
    if (!toDate.success) return;

    const backToTimestamp = convertDateToTimestamp(toDate.date.toISOString(), 'UTC');
    expect(backToTimestamp).toEqual({
      success: true,
      seconds: 1700000000,
      milliseconds: 1700000000000,
    });
  });
});
