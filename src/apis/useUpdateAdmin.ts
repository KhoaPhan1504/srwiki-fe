import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Admin } from './useGetAdmins';

type UpdateAdminPayload = {
  id: string;
  fullName?: string;
  address?: string | null;
  dateOfBirth?: string | null;
};

export const useUpdateAdmin = () => {
  const { t } = useTranslation('admin-members');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateAdminPayload) => {
      const res = await httpClient.put<Admin>(`${Endpoints.ADMIN_ADMINS}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.ADMIN_ADMINS] });
      toast.success(t('editAdmin.success'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('editAdmin.error'), { position: 'top-center' });
    },
  });
};
