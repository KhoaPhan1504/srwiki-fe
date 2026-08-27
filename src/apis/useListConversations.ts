import { useQuery } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

export type ConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export const useListConversations = () => {
  const getConversations = async ({
    signal,
  }: {
    signal?: AbortSignal;
  }): Promise<ConversationSummary[]> => {
    const res = await httpClient.get<ConversationSummary[]>(Endpoints.AI_CONVERSATIONS, {
      signal,
    });
    return res.data;
  };

  const { data, isLoading } = useQuery<ConversationSummary[]>({
    queryKey: [Endpoints.AI_CONVERSATIONS],
    queryFn: getConversations,
  });

  return { conversations: data ?? [], isLoading };
};
