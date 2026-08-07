import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Profile } from '~root/apis/useGetProfile';

type UpdatePayload = Partial<Pick<Profile, 'fullName' | 'address' | 'dateOfBirth' | 'bio'>>;

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdatePayload) => {
      const res = await httpClient.put<Profile>(Endpoints.PROFILE, payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([Endpoints.PROFILE], data);
    },
  });
};
