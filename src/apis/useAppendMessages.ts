import { useMutation } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { AiMessage } from '~root/ai-tools/client';

type AppendMessagesPayload = { conversationId: string; messages: AiMessage[] };
type AppendMessagesResponse = {
  messages: Array<{ id: string; payload: AiMessage; createdAt: string }>;
};

export const useAppendMessages = () => {
  return useMutation({
    mutationFn: async ({
      conversationId,
      messages,
    }: AppendMessagesPayload): Promise<AppendMessagesResponse> => {
      const res = await httpClient.post<AppendMessagesResponse>(
        `${Endpoints.AI_CONVERSATIONS}/${conversationId}/messages`,
        { messages },
      );
      return res.data;
    },
  });
};
