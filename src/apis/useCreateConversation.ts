import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { ConversationSummary } from '~root/apis/useListConversations';

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string }): Promise<ConversationSummary> => {
      const res = await httpClient.post<ConversationSummary>(Endpoints.AI_CONVERSATIONS, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Endpoints.AI_CONVERSATIONS] });
    },
  });
};
