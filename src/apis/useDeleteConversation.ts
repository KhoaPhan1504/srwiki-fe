import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

export const useDeleteConversation = () => {
  const { t } = useTranslation('ai-assistant');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string): Promise<void> => {
      await httpClient.delete(`${Endpoints.AI_CONVERSATIONS}/${conversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.AI_CONVERSATIONS] });
      toast.success(t('toast.deleteSuccess'), { position: 'top-center' });
    },
    onError: () => {
      toast.error(t('toast.deleteError'), { position: 'top-center' });
    },
  });
};
