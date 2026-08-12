import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Notification } from '~root/apis/useGetNotifications';
import { toast } from 'react-toastify';

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await httpClient.patch<Notification>(`${Endpoints.NOTIFICATIONS}/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.NOTIFICATIONS] });
    },
    onError: () => {
      toast.error('Đánh dấu đã đọc thất bại.', { position: 'top-center' });
    },
  });
};
