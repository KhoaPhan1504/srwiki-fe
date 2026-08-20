import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { SidebarContent } from './index';
import { authAtom } from '~root/stores';
import type { AuthState } from '~root/stores';
import { MembershipTier, Role } from '~root/constants';

vi.mock('~root/apis', () => ({ useLogout: () => vi.fn() }));

const renderSidebar = (auth: AuthState) => {
  const store = createStore();
  store.set(authAtom, auth);
  return render(
    <JotaiProvider store={store}>
      <MemoryRouter>
        <SidebarContent logoSrc="/logo.svg" />
      </MemoryRouter>
    </JotaiProvider>,
  );
};

describe('SidebarContent', () => {
  it('shows the Member List item for an admin', () => {
    renderSidebar({
      token: 'tok',
      user: { id: '1', email: 'a@b.com', role: Role.ADMIN, membershipTier: null },
    });
    expect(screen.getByText('Danh sách thành viên')).toBeInTheDocument();
  });

  it('shows the Member List item for a super_admin', () => {
    renderSidebar({
      token: 'tok',
      user: { id: '1', email: 'a@b.com', role: Role.SUPER_ADMIN, membershipTier: null },
    });
    expect(screen.getByText('Danh sách thành viên')).toBeInTheDocument();
  });

  it('hides the Member List item for a member', () => {
    renderSidebar({
      token: 'tok',
      user: {
        id: '1',
        email: 'a@b.com',
        role: Role.MEMBER,
        membershipTier: MembershipTier.REGULAR,
      },
    });
    expect(screen.queryByText('Danh sách thành viên')).not.toBeInTheDocument();
  });

  it('shows the Regex Tester tool item for a member (tools are open to everyone)', () => {
    renderSidebar({
      token: 'tok',
      user: {
        id: '1',
        email: 'a@b.com',
        role: Role.MEMBER,
        membershipTier: MembershipTier.REGULAR,
      },
    });
    expect(screen.getByText('Regex Tester')).toBeInTheDocument();
  });
});
