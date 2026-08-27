import { useQuery } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { AiMessage } from '~root/ai-tools/client';
import type { ConversationSummary } from '~root/apis/useListConversations';

export type ConversationDetail = ConversationSummary & {
  messages: Array<{ id: string; payload: AiMessage; createdAt: string }>;
};

export const useGetConversation = (conversationId: string | null) => {
  const getConversation = async ({
    signal,
  }: {
    signal?: AbortSignal;
  }): Promise<ConversationDetail> => {
    const res = await httpClient.get<ConversationDetail>(
      `${Endpoints.AI_CONVERSATIONS}/${conversationId}`,
      { signal },
    );
    return res.data;
  };

  return useQuery<ConversationDetail>({
    queryKey: [Endpoints.AI_CONVERSATIONS, conversationId],
    queryFn: getConversation,
    enabled: !!conversationId,
  });
};
