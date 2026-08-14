import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import AdminMembersPage from '~root/pages/AdminMembers';
import DashboardPage from '~root/pages/Dashboard';
import ProfilePage from '~root/pages/Profile';
import SettingsPage from '~root/pages/Settings';
import { authAtom } from '~root/stores';
import type { AuthUser } from '~root/stores';

interface PrivateRouteProps {
  element: ReactElement;
  allowedRoles?: Array<AuthUser['role']>;
}

export const PrivateRoute = ({ element, allowedRoles }: PrivateRouteProps) => {
  const auth = useAtomValue(authAtom);
  const location = useLocation();

  if (!auth?.token) {
    const callbackUrl = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

export const protectedRoutes: RouteObject[] = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard', element: <PrivateRoute element={<DashboardPage />} /> },
  { path: '/profile', element: <PrivateRoute element={<ProfilePage />} /> },
  { path: '/settings', element: <PrivateRoute element={<SettingsPage />} /> },
  {
    path: '/admin/members',
    element: <PrivateRoute element={<AdminMembersPage />} allowedRoles={['admin']} />,
  },
];
