import type { MembershipTier } from '~root/apis';

export type MemberFilters = {
  membershipTier: MembershipTier[];
  createdAtFrom: string;
  createdAtTo: string;
  address: string;
  birthdayFrom: string;
  birthdayTo: string;
};

export const EMPTY_FILTERS: MemberFilters = {
  membershipTier: [],
  createdAtFrom: '',
  createdAtTo: '',
  address: '',
  birthdayFrom: '',
  birthdayTo: '',
};
