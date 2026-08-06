import { useMutation } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

export const useDeleteAccount = () =>
  useMutation({
    mutationFn: async () => {
      await httpClient.delete(Endpoints.PROFILE);
    },
  });
