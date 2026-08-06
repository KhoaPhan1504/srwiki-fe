import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Profile } from '~root/apis/useGetProfile';

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { phone: string; code: string }) => {
      const res = await httpClient.post<Profile>(Endpoints.PROFILE_PHONE_VERIFY_OTP, payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([Endpoints.PROFILE], data);
    },
  });
};
