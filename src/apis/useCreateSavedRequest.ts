import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { AuthConfig, BodyType, HttpMethod, KeyValuePair, SavedRequest } from '~root/types';

type CreateSavedRequestPayload = {
  collectionId: string;
  name: string;
  method: HttpMethod;
  url: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  bodyType: BodyType;
  bodyFields: KeyValuePair[];
  auth: AuthConfig;
};

export const useCreateSavedRequest = () => {
  const { t } = useTranslation('rest-api-client');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ collectionId, ...payload }: CreateSavedRequestPayload) => {
      const res = await httpClient.post<SavedRequest>(
        `${Endpoints.REST_COLLECTIONS}/${collectionId}/requests`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.REST_COLLECTIONS] });
      toast.success(t('collections.toast.saveRequestSuccess'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('collections.toast.saveRequestError'), { position: 'top-center' });
    },
  });
};
