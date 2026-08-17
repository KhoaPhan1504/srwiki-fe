import { describe, expect, it } from 'vitest';
import { act, renderHook, screen } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAdminMembersFilters, useAdminAdminsFilters } from './index';

const LocationProbe = () => {
  const [params] = useSearchParams();
  return <div data-testid="location">{params.toString()}</div>;
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/admin-members?tab=members']}>
    {children}
    <LocationProbe />
  </MemoryRouter>
);

describe('useAdminMembersFilters', () => {
  it('defaults to page 1, no filters, no sort', () => {
    const { result } = renderHook(() => useAdminMembersFilters(), { wrapper });
    expect(result.current.page).toBe(1);
    expect(result.current.filters).toEqual({});
    expect(result.current.sort).toBeNull();
  });

  it('setPage writes page to the URL and preserves tab', () => {
    const { result } = renderHook(() => useAdminMembersFilters(), { wrapper });
    act(() => result.current.setPage(3));
    expect(screen.getByTestId('location').textContent).toContain('page=3');
    expect(screen.getByTestId('location').textContent).toContain('tab=members');
  });

  it('setSort writes sortBy/sortDirection and resets page to 1', () => {
    const { result } = renderHook(() => useAdminMembersFilters(), { wrapper });
    act(() => result.current.setPage(3));
    act(() => result.current.setSort({ column: 'email', direction: 'asc' }));
    expect(result.current.sort).toEqual({ column: 'email', direction: 'asc' });
    expect(result.current.page).toBe(1);
  });

  it('setFilters round-trips a multiSelect, a text, and a dateRange filter', () => {
    const { result } = renderHook(() => useAdminMembersFilters(), { wrapper });
    act(() =>
      result.current.setFilters({
        membershipTier: ['regular', 'vip'],
        address: 'Ha Noi',
        createdAt: { from: new Date('2026-01-01'), to: new Date('2026-02-01') },
      }),
    );
    expect(result.current.filters.membershipTier).toEqual(['regular', 'vip']);
    expect(result.current.filters.address).toBe('Ha Noi');
    const createdAt = result.current.filters.createdAt as { from?: Date; to?: Date };
    expect(createdAt.from?.toISOString().slice(0, 10)).toBe('2026-01-01');
    expect(createdAt.to?.toISOString().slice(0, 10)).toBe('2026-02-01');
  });

  it('does not clobber Admins-tab params (adminsXxx) when writing Members state', () => {
    const adminsWrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={['/admin-members?tab=members&adminsPage=2']}>
        {children}
        <LocationProbe />
      </MemoryRouter>
    );
    const { result } = renderHook(() => useAdminMembersFilters(), { wrapper: adminsWrapper });
    act(() => result.current.setPage(2));
    expect(screen.getByTestId('location').textContent).toContain('adminsPage=2');
  });
});

describe('useAdminAdminsFilters', () => {
  it('defaults to page 1, no filters, no sort', () => {
    const { result } = renderHook(() => useAdminAdminsFilters(), { wrapper });
    expect(result.current.page).toBe(1);
    expect(result.current.filters).toEqual({});
    expect(result.current.sort).toBeNull();
  });

  it('setPage writes adminsPage and does not collide with Members-tab page', () => {
    const combinedWrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={['/admin-members?tab=admins&page=5']}>
        {children}
        <LocationProbe />
      </MemoryRouter>
    );
    const { result } = renderHook(() => useAdminAdminsFilters(), { wrapper: combinedWrapper });
    act(() => result.current.setPage(2));
    expect(screen.getByTestId('location').textContent).toContain('adminsPage=2');
    expect(screen.getByTestId('location').textContent).toContain('page=5');
  });

  it('setFilters round-trips address and createdAt', () => {
    const { result } = renderHook(() => useAdminAdminsFilters(), { wrapper });
    act(() =>
      result.current.setFilters({
        address: 'Da Nang',
        createdAt: { from: new Date('2026-03-01'), to: new Date('2026-04-01') },
      }),
    );
    expect(result.current.filters.address).toBe('Da Nang');
    const createdAt = result.current.filters.createdAt as { from?: Date; to?: Date };
    expect(createdAt.from?.toISOString().slice(0, 10)).toBe('2026-03-01');
  });
});
