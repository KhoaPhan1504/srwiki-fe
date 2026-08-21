import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

export const useDeleteSavedRequest = () => {
  const { t } = useTranslation('rest-api-client');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`${Endpoints.REST_SAVED_REQUESTS}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.REST_COLLECTIONS] });
      toast.success(t('collections.toast.deleteRequestSuccess'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('collections.toast.deleteRequestError'), { position: 'top-center' });
    },
  });
};
