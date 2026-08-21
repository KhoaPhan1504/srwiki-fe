import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Environment } from '~root/types';

export const useCreateEnvironment = () => {
  const { t } = useTranslation('rest-api-client');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const res = await httpClient.post<Environment>(Endpoints.REST_ENVIRONMENTS, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.REST_ENVIRONMENTS] });
      toast.success(t('environments.toast.createSuccess'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('environments.toast.createError'), { position: 'top-center' });
    },
  });
};
