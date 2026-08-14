import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Admin } from './useGetAdmins';

type CreateAdminPayload = {
  email: string;
  password: string;
  fullName: string;
  address?: string;
  dateOfBirth?: string;
};

export const useCreateAdmin = () => {
  const { t } = useTranslation('admin-members');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAdminPayload) => {
      const res = await httpClient.post<Admin>(Endpoints.ADMIN_ADMINS, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.ADMIN_ADMINS] });
      toast.success(t('createAdmin.success'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('createAdmin.error'), { position: 'top-center' });
    },
  });
};
