import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { SidebarContent } from './index';
import { filterTree } from './filterTree';
import { authAtom } from '~root/stores';
import type { AuthState } from '~root/stores';
import { MembershipTier, Role } from '~root/constants';
import type { RouteType } from '~root/routes/routeTree';

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
    expect(screen.getByText('Kiểm tra Regex')).toBeInTheDocument();
  });

  it('does not render a Logout button', () => {
    renderSidebar(memberAuth);
    expect(screen.queryByText('Đăng xuất')).not.toBeInTheDocument();
  });

  it('renders every item, including Dashboard/Profile/Settings, inside the single scrollable nav area', () => {
    renderSidebar(memberAuth);
    const scrollArea = document.querySelector('.overflow-y-auto') as HTMLElement;
    expect(scrollArea).not.toBeNull();
    expect(scrollArea).toContainElement(screen.getByText('Trang chủ'));
    expect(scrollArea).toContainElement(screen.getByText('Hồ sơ'));
    expect(scrollArea).toContainElement(screen.getByText('Cài đặt'));
    expect(scrollArea).toContainElement(screen.getByText('Kiểm tra Regex'));
  });

  it('splits tools between the Tools and Development groups', () => {
    renderSidebar(memberAuth);
    expect(screen.getByText('Công cụ')).toBeInTheDocument();
    expect(screen.getByText('Phát triển')).toBeInTheDocument();
    expect(screen.getByText('Định dạng JSON')).toBeInTheDocument();
    expect(screen.getByText('REST API Client')).toBeInTheDocument();
  });
});

describe('filterTree', () => {
  const tree: RouteType[] = [
    { title: 'a', path: '/a' },
    { title: 'admin-leaf', path: '/admin-leaf', adminOnly: true },
    {
      title: 'mixed-group',
      children: [
        { title: 'b', path: '/b' },
        { title: 'admin-in-group', path: '/admin-in-group', adminOnly: true },
      ],
    },
    {
      title: 'admin-only-group',
      children: [{ title: 'c', path: '/c', adminOnly: true }],
    },
  ];

  it('keeps everything for an admin', () => {
    const result = filterTree(tree, true);
    expect(result).toHaveLength(4);
  });

  it('drops adminOnly leaves and hides a group left with zero visible children', () => {
    const result = filterTree(tree, false);
    expect(result.map((node) => node.title)).toEqual(['a', 'mixed-group']);
    expect(result[1].children?.map((child) => child.title)).toEqual(['b']);
  });
});
