import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import AdminMembersPage from '~root/pages/AdminMembers';
import Base64EncoderDecoderPage from '~root/pages/Base64EncoderDecoder';
import ColorConverterPage from '~root/pages/ColorConverter';
import CurlGeneratorPage from '~root/pages/CurlGenerator';
import DashboardPage from '~root/pages/Dashboard';
import JsonFormatterPage from '~root/pages/JsonFormatter';
import JwtWebTokenPage from '~root/pages/JwtWebToken';
import MarkdownPreviewPage from '~root/pages/MarkdownPreview';
import ProfilePage from '~root/pages/Profile';
import RegexTesterPage from '~root/pages/RegexTester';
import RestApiClientPage from '~root/pages/RestApiClient';
import SettingsPage from '~root/pages/Settings';
import TimestampConverterPage from '~root/pages/TimestampConverter';
import UnitConverterPage from '~root/pages/UnitConverter';
import UrlEncoderDecoderPage from '~root/pages/UrlEncoderDecoder';
import UuidGeneratorPage from '~root/pages/UuidGenerator';
import { authAtom } from '~root/stores';
import type { AuthUser } from '~root/stores';
import { Role } from '~root/constants';

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
  { path: '/tools/json-formatter', element: <PrivateRoute element={<JsonFormatterPage />} /> },
  { path: '/tools/jwt', element: <PrivateRoute element={<JwtWebTokenPage />} /> },
  { path: '/tools/uuid-generator', element: <PrivateRoute element={<UuidGeneratorPage />} /> },
  { path: '/tools/regex-tester', element: <PrivateRoute element={<RegexTesterPage />} /> },
  {
    path: '/tools/markdown-preview',
    element: <PrivateRoute element={<MarkdownPreviewPage />} />,
  },
  { path: '/tools/base64', element: <PrivateRoute element={<Base64EncoderDecoderPage />} /> },
  {
    path: '/tools/url-encoder-decoder',
    element: <PrivateRoute element={<UrlEncoderDecoderPage />} />,
  },
  {
    path: '/tools/timestamp-converter',
    element: <PrivateRoute element={<TimestampConverterPage />} />,
  },
  {
    path: '/tools/color-converter',
    element: <PrivateRoute element={<ColorConverterPage />} />,
  },
  {
    path: '/tools/unit-converter',
    element: <PrivateRoute element={<UnitConverterPage />} />,
  },
  {
    path: '/tools/rest-api-client',
    element: <PrivateRoute element={<RestApiClientPage />} />,
  },
  {
    path: '/tools/curl-generator',
    element: <PrivateRoute element={<CurlGeneratorPage />} />,
  },
  {
    path: '/admin/members',
    element: (
      <PrivateRoute element={<AdminMembersPage />} allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]} />
    ),
  },
];
