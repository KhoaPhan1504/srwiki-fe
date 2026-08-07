import { useSetAtom } from 'jotai';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import { authAtom } from '~root/screens/auth/login/stores';

export const useLogout = () => {
  const setAuth = useSetAtom(authAtom);

  return () => {
    httpClient
      .post(Endpoints.AUTH_LOGOUT)
      .catch(() => {})
      .finally(() => {
        localStorage.removeItem('auth');
        localStorage.removeItem('refreshToken');
        setAuth(null);
      });
  };
};
