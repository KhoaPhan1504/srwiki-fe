import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Collection } from '~root/types';

export const useCreateCollection = () => {
  const { t } = useTranslation('rest-api-client');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const res = await httpClient.post<Collection>(Endpoints.REST_COLLECTIONS, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.REST_COLLECTIONS] });
      toast.success(t('collections.toast.createCollectionSuccess'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('collections.toast.createCollectionError'), { position: 'top-center' });
    },
  });
};
