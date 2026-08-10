import type { RouteObject } from 'react-router-dom';
import LoginPage from '~root/pages/Auth/Login';
import RegisterPage from '~root/pages/Auth/Register';
import AccessRemovedPage from '~root/pages/Auth/AccessRemoved';

export const publicRoutes: RouteObject[] = [
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/register', element: <RegisterPage /> },
  { path: '/auth/access-removed', element: <AccessRemovedPage /> },
  { path: '*', element: <div>Không tìm thấy trang.</div> },
];
