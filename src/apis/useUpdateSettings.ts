import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Settings } from '~root/apis/useGetSettings';
import { toast } from 'react-toastify';

export const useUpdateSettings = () => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Settings>) => {
      const res = await httpClient.put<Settings>(Endpoints.SETTINGS, payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([Endpoints.SETTINGS], data);
      toast.success(t('settingsSaved'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('settingsSaveError'), { position: 'top-center' });
    },
  });
};
