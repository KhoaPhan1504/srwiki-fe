import { describe, expect, it } from 'vitest';
import { toolRegistry } from '~root/ai-tools';

describe('convert_timestamp tool', () => {
  it('converts a timestamp in seconds to a date', async () => {
    const result = await toolRegistry.execute('convert_timestamp', {
      mode: 'timestampToDate',
      input: '0',
      unit: 'seconds',
    });

    expect(result).toEqual({
      success: true,
      data: { date: '1970-01-01T00:00:00.000Z', milliseconds: 0 },
    });
  });

  it('converts a UTC date string to a timestamp', async () => {
    const result = await toolRegistry.execute('convert_timestamp', {
      mode: 'dateToTimestamp',
      input: '1970-01-01T00:00:00Z',
      timezone: 'UTC',
    });

    expect(result).toEqual({ success: true, data: { seconds: 0, milliseconds: 0 } });
  });

  it('returns a validation error for a non-numeric timestamp', async () => {
    const result = await toolRegistry.execute('convert_timestamp', {
      mode: 'timestampToDate',
      input: 'abc',
      unit: 'seconds',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
      expect(result.error.code).toBe('INVALID_TIMESTAMP');
    }
  });

  it('returns a validation error for an unrecognized date string', async () => {
    const result = await toolRegistry.execute('convert_timestamp', {
      mode: 'dateToTimestamp',
      input: 'not-a-date',
      timezone: 'UTC',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
      expect(result.error.code).toBe('INVALID_DATE');
    }
  });
});
