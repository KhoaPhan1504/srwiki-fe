import { useSetAtom } from 'jotai';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import { queryClient } from '~root/lib/query-client';
import { authAtom } from '~root/stores';

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
        // Prevents the next user to log in on this tab from briefly seeing
        // this user's cached profile/settings (client-side nav, no reload).
        queryClient.clear();
      });
  };
};
