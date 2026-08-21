import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Collection } from '~root/types';

type RenameCollectionPayload = { id: string; name: string };

export const useRenameCollection = () => {
  const { t } = useTranslation('rest-api-client');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: RenameCollectionPayload) => {
      const res = await httpClient.patch<Collection>(`${Endpoints.REST_COLLECTIONS}/${id}`, {
        name,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.REST_COLLECTIONS] });
      toast.success(t('collections.toast.renameCollectionSuccess'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('collections.toast.renameCollectionError'), { position: 'top-center' });
    },
  });
};
