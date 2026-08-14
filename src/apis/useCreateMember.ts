import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Member } from './useGetMembers';

type CreateMemberPayload = {
  email: string;
  password: string;
  fullName: string;
  address?: string;
  dateOfBirth?: string;
};

export const useCreateMember = () => {
  const { t } = useTranslation('admin-members');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMemberPayload) => {
      const res = await httpClient.post<Member>(Endpoints.ADMIN_MEMBERS, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.ADMIN_MEMBERS] });
      toast.success(t('create.success'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('create.error'), { position: 'top-center' });
    },
  });
};
