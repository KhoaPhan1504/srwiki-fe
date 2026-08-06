import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { authAtom } from '~root/screens/auth/login/stores';

export const ProtectedRoute = () => {
  const auth = useAtomValue(authAtom);
  const location = useLocation();

  if (!auth?.token) {
    const callbackUrl = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} replace />;
  }

  return <Outlet />;
};
