import { describe, expect, it } from 'vitest';
import { toCreatedAtFromIso, toCreatedAtToIso } from './utils';

describe('toCreatedAtFromIso', () => {
  it('returns undefined for an empty string', () => {
    expect(toCreatedAtFromIso('', 'UTC')).toBeUndefined();
  });

  it('returns UTC midnight for the given day in UTC mode', () => {
    expect(toCreatedAtFromIso('2026-08-14', 'UTC')).toBe('2026-08-14T00:00:00.000Z');
  });
});

describe('toCreatedAtToIso', () => {
  it('returns undefined for an empty string', () => {
    expect(toCreatedAtToIso('', 'UTC')).toBeUndefined();
  });

  it('returns UTC end-of-day for the given day in UTC mode', () => {
    expect(toCreatedAtToIso('2026-08-14', 'UTC')).toBe('2026-08-14T23:59:59.999Z');
  });

  it('is well-formed in local mode', () => {
    const local = toCreatedAtToIso('2026-08-14', 'local');
    expect(local).toBeDefined();
    expect(new Date(local as string).toString()).not.toBe('Invalid Date');
  });
});
