import { describe, expect, it } from 'vitest';
import { countActiveFilterGroups } from './index';
import { EMPTY_FILTERS } from '../types';
import { MembershipTier } from '~root/constants';

describe('countActiveFilterGroups', () => {
  it('returns 0 when no filters are active', () => {
    expect(countActiveFilterGroups(EMPTY_FILTERS)).toBe(0);
  });

  it('counts Regular + VIP membership tier as a single group', () => {
    expect(
      countActiveFilterGroups({
        ...EMPTY_FILTERS,
        membershipTier: [MembershipTier.REGULAR, MembershipTier.VIP],
      }),
    ).toBe(1);
  });

  it('counts createdAt range as a single group even with only one bound set', () => {
    expect(countActiveFilterGroups({ ...EMPTY_FILTERS, createdAtFrom: '2026-01-01' })).toBe(1);
  });

  it('sums independent groups', () => {
    expect(
      countActiveFilterGroups({
        ...EMPTY_FILTERS,
        membershipTier: [MembershipTier.VIP],
        address: 'Ha Noi',
        birthdayFrom: '1990-01-01',
      }),
    ).toBe(3);
  });
});
