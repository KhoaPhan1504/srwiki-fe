import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints, type MembershipTier } from '~root/constants';
import type { Member } from './useGetMembers';

type UpdateMemberPayload = {
  id: string;
  fullName?: string;
  address?: string | null;
  dateOfBirth?: string | null;
  membershipTier?: MembershipTier;
};

export const useUpdateMember = () => {
  const { t } = useTranslation('admin-members');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateMemberPayload) => {
      const res = await httpClient.put<Member>(`${Endpoints.ADMIN_MEMBERS}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.ADMIN_MEMBERS] });
      toast.success(t('edit.success'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('edit.error'), { position: 'top-center' });
    },
  });
};
