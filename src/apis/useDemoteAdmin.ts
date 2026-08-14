import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Member } from './useGetMembers';

export const useDemoteAdmin = () => {
  const { t } = useTranslation('admin-members');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await httpClient.post<Member>(`${Endpoints.ADMIN_ADMINS}/${id}/demote`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.ADMIN_ADMINS] });
      queryClient.invalidateQueries({ queryKey: [Endpoints.ADMIN_MEMBERS] });
      toast.success(t('demote.success'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('demote.error'), { position: 'top-center' });
    },
  });
};
