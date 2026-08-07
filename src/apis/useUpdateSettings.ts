import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Settings } from '~root/apis/useGetSettings';
import { toast } from 'react-toastify';

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Settings>) => {
      const res = await httpClient.put<Settings>(Endpoints.SETTINGS, payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([Endpoints.SETTINGS], data);
      toast.success('Giao diện đã được lưu.', { position: 'top-center' });
    },
    onError: () => {
      toast.error('Lưu giao diện thất bại.', { position: 'top-center' });
    },
  });
};
