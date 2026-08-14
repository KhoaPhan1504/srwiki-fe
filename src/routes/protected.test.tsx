import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { PrivateRoute } from './protected';
import { authAtom } from '~root/stores';
import type { AuthState } from '~root/stores';
import { Role } from '~root/constants';

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
      user: { id: '1', email: 'a@b.com', role: Role.MEMBER, membershipTier: 'regular' },
    });
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to /dashboard when the role is not in allowedRoles', () => {
    renderWithAuth(
      {
        token: 'tok',
        user: { id: '1', email: 'a@b.com', role: Role.MEMBER, membershipTier: 'regular' },
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
