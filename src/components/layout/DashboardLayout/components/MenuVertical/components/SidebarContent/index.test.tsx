import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { SidebarContent } from './index';
import { authAtom } from '~root/stores';
import type { AuthState } from '~root/stores';
import { MembershipTier, Role } from '~root/constants';

const memberAuth: AuthState = {
  token: 'tok',
  user: { id: '1', email: 'a@b.com', role: Role.MEMBER, membershipTier: MembershipTier.REGULAR },
};

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
    renderSidebar(memberAuth);
    expect(screen.queryByText('Danh sách thành viên')).not.toBeInTheDocument();
  });

  it('shows the Regex Tester tool item for a member (tools are open to everyone)', () => {
    renderSidebar(memberAuth);
    expect(screen.getByText('Regex Tester')).toBeInTheDocument();
  });

  it('does not render a Logout button', () => {
    renderSidebar(memberAuth);
    expect(screen.queryByText('Đăng xuất')).not.toBeInTheDocument();
  });

  it('keeps Dashboard/Profile/Settings pinned outside the scrollable nav area', () => {
    renderSidebar(memberAuth);
    const scrollArea = document.querySelector('.overflow-y-auto') as HTMLElement;
    expect(scrollArea).not.toBeNull();
    expect(within(scrollArea).queryByText('Trang chủ')).not.toBeInTheDocument();
    expect(within(scrollArea).queryByText('Hồ sơ')).not.toBeInTheDocument();
    expect(within(scrollArea).queryByText('Cài đặt')).not.toBeInTheDocument();
    expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    expect(screen.getByText('Hồ sơ')).toBeInTheDocument();
    expect(screen.getByText('Cài đặt')).toBeInTheDocument();
  });

  it('renders tool links inside the scrollable nav area', () => {
    renderSidebar(memberAuth);
    const scrollArea = document.querySelector('.overflow-y-auto') as HTMLElement;
    expect(within(scrollArea).getByText('Regex Tester')).toBeInTheDocument();
    expect(within(scrollArea).getByText('cURL Generator')).toBeInTheDocument();
  });

  it('puts the Member List item in the scrollable area for an admin, not pinned', () => {
    renderSidebar({
      token: 'tok',
      user: { id: '1', email: 'a@b.com', role: Role.ADMIN, membershipTier: null },
    });
    const scrollArea = document.querySelector('.overflow-y-auto') as HTMLElement;
    expect(within(scrollArea).getByText('Danh sách thành viên')).toBeInTheDocument();
  });
});
