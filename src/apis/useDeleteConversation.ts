import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string): Promise<void> => {
      await httpClient.delete(`${Endpoints.AI_CONVERSATIONS}/${conversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.AI_CONVERSATIONS] });
    },
  });
};
