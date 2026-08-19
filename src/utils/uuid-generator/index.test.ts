import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatUuid,
  generateUuid,
  generateUuidV4,
  generateUuidV7,
  parseUuidInfo,
  validateQuantity,
} from '.';
import { UUIDCase, UuidVariant, UUIDVersion } from '~root/constants';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const extractTimestampMs = (uuid: string): number =>
  Number(BigInt(`0x${uuid.replace(/-/g, '').slice(0, 12)}`));

describe('generateUuidV4', () => {
  it('returns a value matching the canonical UUID format', () => {
    expect(generateUuidV4()).toMatch(UUID_REGEX);
  });

  it('sets the version nibble to 4', () => {
    const uuid = generateUuidV4();
    expect(uuid.charAt(14)).toBe('4');
  });

  it('sets the variant bits to the RFC 9562 variant (8, 9, a, or b)', () => {
    const uuid = generateUuidV4();
    expect(uuid.charAt(19)).toMatch(/[89ab]/);
  });

  it('generates different UUIDs on each call', () => {
    const uuids = Array.from({ length: 50 }, () => generateUuidV4());
    expect(new Set(uuids).size).toBe(uuids.length);
  });
});

describe('generateUuidV7', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a value matching the canonical UUID format', () => {
    expect(generateUuidV7()).toMatch(UUID_REGEX);
  });

  it('sets the version nibble to 7', () => {
    const uuid = generateUuidV7();
    expect(uuid.charAt(14)).toBe('7');
  });

  it('sets the variant bits to the RFC 9562 variant (8, 9, a, or b)', () => {
    const uuid = generateUuidV7();
    expect(uuid.charAt(19)).toMatch(/[89ab]/);
  });

  it('encodes the current unix timestamp in milliseconds in the first 48 bits', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-19T10:00:00.000Z'));

    const uuid = generateUuidV7();

    expect(extractTimestampMs(uuid)).toBe(Date.parse('2026-08-19T10:00:00.000Z'));
  });

  it('generates different UUIDs on each call', () => {
    const uuids = Array.from({ length: 50 }, () => generateUuidV7());
    expect(new Set(uuids).size).toBe(uuids.length);
  });

  it('produces time-ordered UUIDs as the clock advances', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-19T10:00:00.000Z'));
    const earlier = generateUuidV7();

    vi.setSystemTime(new Date('2026-08-19T10:00:00.001Z'));
    const later = generateUuidV7();

    expect(extractTimestampMs(later)).toBeGreaterThan(extractTimestampMs(earlier));
    expect(later > earlier).toBe(true);
  });
});

describe('formatUuid', () => {
  const sample = '550e8400-e29b-41d4-a716-446655440000';

  it('lowercases the UUID by default', () => {
    expect(formatUuid(sample.toUpperCase(), { case: UUIDCase.LOWER, removeHyphens: false })).toBe(
      sample,
    );
  });

  it('uppercases the UUID when requested', () => {
    expect(formatUuid(sample, { case: UUIDCase.UPPER, removeHyphens: false })).toBe(
      sample.toUpperCase(),
    );
  });

  it('keeps hyphens when removeHyphens is false', () => {
    expect(formatUuid(sample, { case: UUIDCase.LOWER, removeHyphens: false })).toBe(sample);
  });

  it('removes hyphens when removeHyphens is true', () => {
    expect(formatUuid(sample, { case: UUIDCase.LOWER, removeHyphens: true })).toBe(
      sample.replace(/-/g, ''),
    );
  });

  it('applies case and hyphen removal together', () => {
    expect(formatUuid(sample, { case: UUIDCase.UPPER, removeHyphens: true })).toBe(
      sample.replace(/-/g, '').toUpperCase(),
    );
  });
});

describe('validateQuantity', () => {
  it('accepts the minimum value (1)', () => {
    expect(validateQuantity('1')).toEqual({ valid: true, value: 1 });
  });

  it('accepts the maximum value (100)', () => {
    expect(validateQuantity('100')).toEqual({ valid: true, value: 100 });
  });

  it('accepts a value in range with surrounding whitespace', () => {
    expect(validateQuantity('  5  ')).toEqual({ valid: true, value: 5 });
  });

  it('rejects empty input', () => {
    expect(validateQuantity('')).toEqual({ valid: false, reason: 'EMPTY' });
  });

  it('rejects whitespace-only input', () => {
    expect(validateQuantity('   ')).toEqual({ valid: false, reason: 'EMPTY' });
  });

  it('rejects non-numeric input', () => {
    expect(validateQuantity('abc')).toEqual({ valid: false, reason: 'NOT_A_NUMBER' });
  });

  it('rejects decimal input', () => {
    expect(validateQuantity('5.5')).toEqual({ valid: false, reason: 'NOT_AN_INTEGER' });
  });

  it('rejects negative input', () => {
    expect(validateQuantity('-3')).toEqual({ valid: false, reason: 'TOO_SMALL' });
  });

  it('rejects zero', () => {
    expect(validateQuantity('0')).toEqual({ valid: false, reason: 'TOO_SMALL' });
  });

  it('rejects values above the maximum', () => {
    expect(validateQuantity('101')).toEqual({ valid: false, reason: 'TOO_LARGE' });
  });

  it('rejects extremely large values', () => {
    expect(validateQuantity('999999999')).toEqual({ valid: false, reason: 'TOO_LARGE' });
  });
});

describe('parseUuidInfo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports version 4 and the RFC 9562 variant for a valid v4 UUID', () => {
    const uuid = generateUuidV4();
    expect(parseUuidInfo(uuid)).toEqual({
      valid: true,
      version: 4,
      variant: UuidVariant.RFC9562,
      timestampMs: null,
    });
  });

  it('reports version 7, the RFC 9562 variant and the encoded timestamp for a valid v7 UUID', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-19T10:00:00.000Z'));
    const uuid = generateUuidV7();

    expect(parseUuidInfo(uuid)).toEqual({
      valid: true,
      version: 7,
      variant: UuidVariant.RFC9562,
      timestampMs: Date.parse('2026-08-19T10:00:00.000Z'),
    });
  });

  it('accepts an uppercase UUID', () => {
    const uuid = generateUuidV4().toUpperCase();
    expect(parseUuidInfo(uuid)).toEqual({
      valid: true,
      version: 4,
      variant: UuidVariant.RFC9562,
      timestampMs: null,
    });
  });

  it('accepts a UUID without hyphens', () => {
    const uuid = generateUuidV4().replace(/-/g, '');
    expect(parseUuidInfo(uuid)).toEqual({
      valid: true,
      version: 4,
      variant: UuidVariant.RFC9562,
      timestampMs: null,
    });
  });

  it('rejects an invalid UUID', () => {
    expect(parseUuidInfo('not-a-uuid')).toEqual({ valid: false });
  });

  it('rejects a malformed UUID with a missing group', () => {
    expect(parseUuidInfo('550e8400-e29b-41d4-a716')).toEqual({ valid: false });
  });

  it('rejects a UUID containing non-hex characters', () => {
    expect(parseUuidInfo('550e8400-e29b-41d4-a716-44665544000g')).toEqual({ valid: false });
  });

  it('rejects empty input', () => {
    expect(parseUuidInfo('')).toEqual({ valid: false });
  });
});

describe('generateUuid', () => {
  it('dispatches to a v4 UUID', () => {
    expect(parseUuidInfo(generateUuid(UUIDVersion.V4))).toEqual({
      valid: true,
      version: 4,
      variant: UuidVariant.RFC9562,
      timestampMs: null,
    });
  });

  it('dispatches to a v7 UUID', () => {
    const info = parseUuidInfo(generateUuid(UUIDVersion.V7));
    expect(info.valid).toBe(true);
    expect(info.valid && info.version).toBe(7);
  });
});
