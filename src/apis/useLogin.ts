import { useMutation } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import { localStore } from '~root/stores';
import { authAtom } from '~root/screens/auth/login/stores';
import type { AuthUser } from '~root/screens/auth/login/stores';

type LoginPayload = { email: string; password: string };
type LoginResponse = { token: string; refreshToken: string; user: AuthUser };

const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await httpClient.post<LoginResponse>(Endpoints.AUTH_LOGIN, payload);
  return res.data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const authData = { token: data.token, user: data.user };
      localStorage.setItem('auth', JSON.stringify(authData));
      localStorage.setItem('refreshToken', data.refreshToken);
      localStore.set(authAtom, authData);
    },
  });
};
