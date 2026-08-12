import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import { toast } from 'react-toastify';

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await httpClient.patch<{ markedCount: number }>(
        `${Endpoints.NOTIFICATIONS}/read-all`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.NOTIFICATIONS] });
    },
    onError: () => {
      toast.error('Đánh dấu tất cả đã đọc thất bại.', { position: 'top-center' });
    },
  });
};
