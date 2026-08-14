import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EMPTY_FILTERS } from '../types';
import type { MemberFilters } from '../types';
import type { MembershipTier } from '~root/constants';

const parseFiltersFromParams = (params: URLSearchParams): MemberFilters => ({
  membershipTier: (params.get('membershipTier')?.split(',').filter(Boolean) ??
    []) as MembershipTier[],
  createdAtFrom: params.get('createdAtFrom') ?? '',
  createdAtTo: params.get('createdAtTo') ?? '',
  address: params.get('address') ?? '',
  birthdayFrom: params.get('birthdayFrom') ?? '',
  birthdayTo: params.get('birthdayTo') ?? '',
});

const filtersToParams = (filters: MemberFilters, page: number): Record<string, string> => {
  const params: Record<string, string> = { page: String(page) };
  if (filters.membershipTier.length > 0) params.membershipTier = filters.membershipTier.join(',');
  if (filters.createdAtFrom) params.createdAtFrom = filters.createdAtFrom;
  if (filters.createdAtTo) params.createdAtTo = filters.createdAtTo;
  if (filters.address) params.address = filters.address;
  if (filters.birthdayFrom) params.birthdayFrom = filters.birthdayFrom;
  if (filters.birthdayTo) params.birthdayTo = filters.birthdayTo;
  return params;
};

export const countActiveFilterGroups = (filters: MemberFilters): number =>
  [
    filters.membershipTier.length > 0,
    Boolean(filters.createdAtFrom || filters.createdAtTo),
    Boolean(filters.address),
    Boolean(filters.birthdayFrom || filters.birthdayTo),
  ].filter(Boolean).length;

export const useAdminMembersFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const appliedFilters = useMemo(() => parseFiltersFromParams(searchParams), [searchParams]);
  const page = useMemo(() => {
    const raw = Number(searchParams.get('page') ?? '1');
    return Number.isFinite(raw) && raw >= 1 ? raw : 1;
  }, [searchParams]);

  const applyFilters = useCallback(
    (next: MemberFilters) => setSearchParams(filtersToParams(next, 1)),
    [setSearchParams],
  );

  const clearFilters = useCallback(
    () => setSearchParams(filtersToParams(EMPTY_FILTERS, 1)),
    [setSearchParams],
  );

  const setPage = useCallback(
    (next: number) => setSearchParams(filtersToParams(appliedFilters, next)),
    [appliedFilters, setSearchParams],
  );

  return { appliedFilters, page, applyFilters, clearFilters, setPage };
};
