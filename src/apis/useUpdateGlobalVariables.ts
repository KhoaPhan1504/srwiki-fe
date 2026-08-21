import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { KeyValuePair } from '~root/types';

export const useUpdateGlobalVariables = () => {
  const { t } = useTranslation('rest-api-client');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: KeyValuePair[]) => {
      const res = await httpClient.patch<{ variables: KeyValuePair[] }>(
        Endpoints.REST_GLOBAL_VARIABLES,
        { variables },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.REST_GLOBAL_VARIABLES] });
      toast.success(t('environments.toast.globalUpdateSuccess'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('environments.toast.globalUpdateError'), { position: 'top-center' });
    },
  });
};
