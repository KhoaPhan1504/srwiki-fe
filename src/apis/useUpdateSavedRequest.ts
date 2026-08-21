import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { AuthConfig, BodyType, HttpMethod, KeyValuePair, SavedRequest } from '~root/types';

type UpdateSavedRequestPayload = {
  id: string;
  name?: string;
  method?: HttpMethod;
  url?: string;
  queryParams?: KeyValuePair[];
  headers?: KeyValuePair[];
  body?: string;
  bodyType?: BodyType;
  bodyFields?: KeyValuePair[];
  auth?: AuthConfig;
};

export const useUpdateSavedRequest = () => {
  const { t } = useTranslation('rest-api-client');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateSavedRequestPayload) => {
      const res = await httpClient.patch<SavedRequest>(
        `${Endpoints.REST_SAVED_REQUESTS}/${id}`,
        payload,
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.REST_COLLECTIONS] });
      const messageKey =
        variables.name !== undefined && Object.keys(variables).length === 2
          ? 'collections.toast.renameRequestSuccess'
          : 'collections.toast.saveRequestSuccess';
      toast.success(t(messageKey), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('collections.toast.saveRequestError'), { position: 'top-center' });
    },
  });
};
