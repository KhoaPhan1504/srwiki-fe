import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Admin } from './useGetAdmins';

export const usePromoteMember = () => {
  const { t } = useTranslation('admin-members');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await httpClient.post<Admin>(`${Endpoints.ADMIN_MEMBERS}/${id}/promote`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.ADMIN_MEMBERS] });
      queryClient.invalidateQueries({ queryKey: [Endpoints.ADMIN_ADMINS] });
      toast.success(t('promote.success'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('promote.error'), { position: 'top-center' });
    },
  });
};
