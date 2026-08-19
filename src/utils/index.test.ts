import { describe, expect, it } from 'vitest';
import { formatDuration, getInitials } from './index';

describe('getInitials', () => {
  it('uses the first letter of fullName when present', () => {
    expect(getInitials('nguyen van a', 'a@example.com')).toBe('N');
  });

  it('falls back to email when fullName is empty', () => {
    expect(getInitials('', 'a@example.com')).toBe('A');
  });

  it('falls back to "?" when both are missing', () => {
    expect(getInitials(null, null)).toBe('?');
  });
});

describe('formatDuration', () => {
  it('formats whole minutes with a zero seconds component', () => {
    expect(formatDuration(300)).toBe('05:00');
  });

  it('pads single-digit minutes and seconds', () => {
    expect(formatDuration(65)).toBe('01:05');
  });

  it('formats zero as 00:00', () => {
    expect(formatDuration(0)).toBe('00:00');
  });
});
