import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import { toast } from 'react-toastify';

export const useMarkAllNotificationsRead = () => {
  const { t } = useTranslation('notifications');
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
      toast.error(t('markAllReadError'), { position: 'top-center' });
    },
  });
};
