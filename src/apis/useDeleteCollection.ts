import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

export const useDeleteCollection = () => {
  const { t } = useTranslation('rest-api-client');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`${Endpoints.REST_COLLECTIONS}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.REST_COLLECTIONS] });
      toast.success(t('collections.toast.deleteCollectionSuccess'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('collections.toast.deleteCollectionError'), { position: 'top-center' });
    },
  });
};
