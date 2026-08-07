import { useMutation } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
};

const register = async (payload: RegisterPayload): Promise<{ id: string; email: string }> => {
  const res = await httpClient.post(Endpoints.AUTH_REGISTER, payload);
  return res.data;
};

export const useRegister = () => useMutation({ mutationFn: register });
