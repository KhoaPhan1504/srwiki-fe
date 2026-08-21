import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

export const useDeleteEnvironment = () => {
  const { t } = useTranslation('rest-api-client');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`${Endpoints.REST_ENVIRONMENTS}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.REST_ENVIRONMENTS] });
      toast.success(t('environments.toast.deleteSuccess'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('environments.toast.deleteError'), { position: 'top-center' });
    },
  });
};
