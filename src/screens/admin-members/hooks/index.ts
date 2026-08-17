import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { FilterValue, SortState } from '~root/components/ui';

const MEMBERS_PARAM_KEYS = [
  'page',
  'sortBy',
  'sortDirection',
  'membershipTier',
  'address',
  'createdAtFrom',
  'createdAtTo',
  'birthdayFrom',
  'birthdayTo',
];

type TableUrlState = { filters: Record<string, FilterValue>; sort: SortState | null; page: number };

const dateOnly = (date?: Date): string | undefined => date?.toISOString().slice(0, 10);

const asDateRange = (value: FilterValue | undefined): { from?: Date; to?: Date } =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const parseMembersStateFromParams = (params: URLSearchParams): TableUrlState => {
  const filters: Record<string, FilterValue> = {};

  const membershipTier = params.get('membershipTier');
  if (membershipTier) filters.membershipTier = membershipTier.split(',').filter(Boolean);

  const address = params.get('address');
  if (address) filters.address = address;

  const createdAtFrom = params.get('createdAtFrom');
  const createdAtTo = params.get('createdAtTo');
  if (createdAtFrom || createdAtTo) {
    filters.createdAt = {
      from: createdAtFrom ? new Date(createdAtFrom) : undefined,
      to: createdAtTo ? new Date(createdAtTo) : undefined,
    };
  }

  const birthdayFrom = params.get('birthdayFrom');
  const birthdayTo = params.get('birthdayTo');
  if (birthdayFrom || birthdayTo) {
    filters.birthday = {
      from: birthdayFrom ? new Date(birthdayFrom) : undefined,
      to: birthdayTo ? new Date(birthdayTo) : undefined,
    };
  }

  const sortBy = params.get('sortBy');
  const sortDirection = params.get('sortDirection');
  const sort: SortState | null =
    sortBy && (sortDirection === 'asc' || sortDirection === 'desc')
      ? { column: sortBy, direction: sortDirection }
      : null;

  const rawPage = Number(params.get('page') ?? '1');
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  return { filters, sort, page };
};

const membersStateToParams = (
  filters: Record<string, FilterValue>,
  sort: SortState | null,
  page: number,
  currentParams: URLSearchParams,
): Record<string, string> => {
  const params: Record<string, string> = {};
  currentParams.forEach((value, key) => {
    if (!MEMBERS_PARAM_KEYS.includes(key)) params[key] = value;
  });

  params.page = String(page);

  const membershipTier = filters.membershipTier;
  if (Array.isArray(membershipTier) && membershipTier.length > 0) {
    params.membershipTier = membershipTier.join(',');
  }
  if (typeof filters.address === 'string' && filters.address) {
    params.address = filters.address;
  }
  const createdAt = asDateRange(filters.createdAt);
  const createdAtFrom = dateOnly(createdAt.from);
  const createdAtTo = dateOnly(createdAt.to);
  if (createdAtFrom) params.createdAtFrom = createdAtFrom;
  if (createdAtTo) params.createdAtTo = createdAtTo;

  const birthday = asDateRange(filters.birthday);
  const birthdayFrom = dateOnly(birthday.from);
  const birthdayTo = dateOnly(birthday.to);
  if (birthdayFrom) params.birthdayFrom = birthdayFrom;
  if (birthdayTo) params.birthdayTo = birthdayTo;

  if (sort) {
    params.sortBy = sort.column;
    params.sortDirection = sort.direction;
  }

  return params;
};

export const useAdminMembersFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseMembersStateFromParams(searchParams), [searchParams]);

  const setFilters = useCallback(
    (nextFilters: Record<string, FilterValue>) =>
      setSearchParams(membersStateToParams(nextFilters, state.sort, 1, searchParams)),
    [setSearchParams, state.sort, searchParams],
  );

  const setSort = useCallback(
    (nextSort: SortState | null) =>
      setSearchParams(membersStateToParams(state.filters, nextSort, 1, searchParams)),
    [setSearchParams, state.filters, searchParams],
  );

  const setPage = useCallback(
    (nextPage: number) =>
      setSearchParams(membersStateToParams(state.filters, state.sort, nextPage, searchParams)),
    [setSearchParams, state.filters, state.sort, searchParams],
  );

  return {
    filters: state.filters,
    sort: state.sort,
    page: state.page,
    setFilters,
    setSort,
    setPage,
  };
};

const ADMINS_PARAM_PREFIX = 'admins';

const parseAdminsStateFromParams = (params: URLSearchParams): TableUrlState => {
  const filters: Record<string, FilterValue> = {};

  const address = params.get('adminsAddress');
  if (address) filters.address = address;

  const createdAtFrom = params.get('adminsCreatedAtFrom');
  const createdAtTo = params.get('adminsCreatedAtTo');
  if (createdAtFrom || createdAtTo) {
    filters.createdAt = {
      from: createdAtFrom ? new Date(createdAtFrom) : undefined,
      to: createdAtTo ? new Date(createdAtTo) : undefined,
    };
  }

  const sortBy = params.get('adminsSortBy');
  const sortDirection = params.get('adminsSortDirection');
  const sort: SortState | null =
    sortBy && (sortDirection === 'asc' || sortDirection === 'desc')
      ? { column: sortBy, direction: sortDirection }
      : null;

  const rawPage = Number(params.get('adminsPage') ?? '1');
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  return { filters, sort, page };
};

const adminsStateToParams = (
  filters: Record<string, FilterValue>,
  sort: SortState | null,
  page: number,
  currentParams: URLSearchParams,
): Record<string, string> => {
  const params: Record<string, string> = {};
  currentParams.forEach((value, key) => {
    if (!key.startsWith(ADMINS_PARAM_PREFIX)) params[key] = value;
  });

  params.adminsPage = String(page);

  if (typeof filters.address === 'string' && filters.address) {
    params.adminsAddress = filters.address;
  }
  const createdAt = asDateRange(filters.createdAt);
  const createdAtFrom = dateOnly(createdAt.from);
  const createdAtTo = dateOnly(createdAt.to);
  if (createdAtFrom) params.adminsCreatedAtFrom = createdAtFrom;
  if (createdAtTo) params.adminsCreatedAtTo = createdAtTo;

  if (sort) {
    params.adminsSortBy = sort.column;
    params.adminsSortDirection = sort.direction;
  }

  return params;
};

export const useAdminAdminsFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseAdminsStateFromParams(searchParams), [searchParams]);

  const setFilters = useCallback(
    (nextFilters: Record<string, FilterValue>) =>
      setSearchParams(adminsStateToParams(nextFilters, state.sort, 1, searchParams)),
    [setSearchParams, state.sort, searchParams],
  );

  const setSort = useCallback(
    (nextSort: SortState | null) =>
      setSearchParams(adminsStateToParams(state.filters, nextSort, 1, searchParams)),
    [setSearchParams, state.filters, searchParams],
  );

  const setPage = useCallback(
    (nextPage: number) =>
      setSearchParams(adminsStateToParams(state.filters, state.sort, nextPage, searchParams)),
    [setSearchParams, state.filters, state.sort, searchParams],
  );

  return {
    filters: state.filters,
    sort: state.sort,
    page: state.page,
    setFilters,
    setSort,
    setPage,
  };
};
