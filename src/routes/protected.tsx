import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { authAtom } from '~root/screens/auth/login/stores';
import DashboardPage from '~root/pages/Dashboard';
import ProfilePage from '~root/pages/Profile';
import SettingsPage from '~root/pages/Settings';

interface PrivateRouteProps {
  element: ReactElement;
}

export const PrivateRoute = ({ element }: PrivateRouteProps) => {
  const auth = useAtomValue(authAtom);
  const location = useLocation();

  if (!auth?.token) {
    const callbackUrl = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} replace />;
  }

  return element;
};

export const protectedRoutes: RouteObject[] = [
  { path: '/dashboard', element: <PrivateRoute element={<DashboardPage />} /> },
  { path: '/profile', element: <PrivateRoute element={<ProfilePage />} /> },
  { path: '/settings', element: <PrivateRoute element={<SettingsPage />} /> },
];
