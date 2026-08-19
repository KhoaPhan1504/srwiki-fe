import { describe, expect, it } from 'vitest';
import { fuzzyScore } from './index';

describe('fuzzyScore', () => {
  it('returns 1 for an empty query', () => {
    expect(fuzzyScore('', 'anything')).toBe(1);
  });

  it('returns null when the query is not a subsequence of the target', () => {
    expect(fuzzyScore('xyz', 'command palette')).toBeNull();
  });

  it('matches diacritics-insensitively', () => {
    expect(fuzzyScore('duong', 'Đường dẫn')).not.toBeNull();
  });

  it('scores a consecutive, word-start match higher than a scattered one', () => {
    const consecutive = fuzzyScore('com', 'Command Palette');
    const scattered = fuzzyScore('cle', 'Command Palette');
    expect(consecutive).not.toBeNull();
    expect(scattered).not.toBeNull();
    expect(consecutive as number).toBeGreaterThan(scattered as number);
  });
});
