import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { PrivateRoute, flattenRouteTree } from './protected';
import { authAtom } from '~root/stores';
import type { AuthState } from '~root/stores';
import { MembershipTier, Role } from '~root/constants';
import type { RouteType } from './routeTree';

const renderWithAuth = (auth: AuthState, allowedRoles?: Array<Role>) => {
  const store = createStore();
  store.set(authAtom, auth);
  return render(
    <JotaiProvider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute element={<div>Protected content</div>} allowedRoles={allowedRoles} />
            }
          />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
          <Route path="/auth/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </JotaiProvider>,
  );
};

describe('PrivateRoute', () => {
  it('redirects to login when not authenticated', () => {
    renderWithAuth(null);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders children when authenticated and no role restriction is set', () => {
    renderWithAuth({
      token: 'tok',
      user: {
        id: '1',
        email: 'a@b.com',
        role: Role.MEMBER,
        membershipTier: MembershipTier.REGULAR,
      },
    });
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to /dashboard when the role is not in allowedRoles', () => {
    renderWithAuth(
      {
        token: 'tok',
        user: {
          id: '1',
          email: 'a@b.com',
          role: Role.MEMBER,
          membershipTier: MembershipTier.REGULAR,
        },
      },
      [Role.ADMIN],
    );
    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('renders children when the role is in allowedRoles', () => {
    renderWithAuth(
      {
        token: 'tok',
        user: { id: '1', email: 'a@b.com', role: Role.ADMIN, membershipTier: null },
      },
      [Role.ADMIN],
    );
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});

const Stub = () => null;

describe('flattenRouteTree', () => {
  it('produces one RouteObject per node that has both path and element, skipping group headers', () => {
    const tree: RouteType[] = [
      { title: 'a', path: '/a', element: <Stub /> },
      {
        title: 'group',
        children: [
          { title: 'b', path: '/b', element: <Stub /> },
          { title: 'header-only, no path or element' },
        ],
      },
    ];

    const result = flattenRouteTree(tree);

    expect(result.map((route) => route.path)).toEqual(['/a', '/b']);
  });

  it('wraps adminOnly nodes with allowedRoles for ADMIN and SUPER_ADMIN', () => {
    const tree: RouteType[] = [
      { title: 'admin', path: '/admin', element: <Stub />, adminOnly: true },
    ];

    const [route] = flattenRouteTree(tree);
    const wrapped = route.element as ReactElement<{ allowedRoles?: Role[] }>;

    expect(wrapped.props.allowedRoles).toEqual([Role.ADMIN, Role.SUPER_ADMIN]);
  });

  it('leaves allowedRoles undefined for regular nodes', () => {
    const tree: RouteType[] = [{ title: 'plain', path: '/plain', element: <Stub /> }];

    const [route] = flattenRouteTree(tree);
    const wrapped = route.element as ReactElement<{ allowedRoles?: Role[] }>;

    expect(wrapped.props.allowedRoles).toBeUndefined();
  });
});
