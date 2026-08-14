import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

export const useDeleteAdmin = () => {
  const { t } = useTranslation('admin-members');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`${Endpoints.ADMIN_ADMINS}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.ADMIN_ADMINS] });
      toast.success(t('deleteAdmin.success'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('deleteAdmin.error'), { position: 'top-center' });
    },
  });
};
