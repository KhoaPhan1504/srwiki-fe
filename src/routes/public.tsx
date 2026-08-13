import type { RouteObject } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginPage from '~root/pages/Auth/Login';
import RegisterPage from '~root/pages/Auth/Register';
import AccessRemovedPage from '~root/pages/Auth/AccessRemoved';

const NotFound = () => {
  const { t } = useTranslation('common');
  return <div>{t('notFound')}</div>;
};

export const publicRoutes: RouteObject[] = [
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/register', element: <RegisterPage /> },
  { path: '/auth/access-removed', element: <AccessRemovedPage /> },
  { path: '*', element: <NotFound /> },
];
