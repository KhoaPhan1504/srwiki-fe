import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Environment, KeyValuePair } from '~root/types';

type UpdateEnvironmentPayload = { id: string; name?: string; variables?: KeyValuePair[] };

export const useUpdateEnvironment = () => {
  const { t } = useTranslation('rest-api-client');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateEnvironmentPayload) => {
      const res = await httpClient.patch<Environment>(
        `${Endpoints.REST_ENVIRONMENTS}/${id}`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.REST_ENVIRONMENTS] });
      toast.success(t('environments.toast.updateSuccess'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('environments.toast.updateError'), { position: 'top-center' });
    },
  });
};
