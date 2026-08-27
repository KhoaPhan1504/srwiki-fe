import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import { toolRegistry } from '.';
import { toAnthropicTools } from './adapters/anthropic';

export type AiTurn =
  | { type: 'reply'; content: string }
  | {
      type: 'tool_call';
      toolCallId: string;
      toolName: string;
      toolInput: unknown;
      providerData?: string;
    };

export type AiMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; turns: AiTurn[]; model?: string }
  | { role: 'tool_result'; toolCallId: string; result: unknown };

interface AiChatResponseBody {
  turns: AiTurn[];
}

const MAX_TOOL_ROUNDS = 5;

export const continueConversation = async (
  messages: AiMessage[],
  model: string,
): Promise<AiMessage[]> => {
  const tools = toAnthropicTools(toolRegistry.list());
  let history = messages;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const { data } = await httpClient.post<AiChatResponseBody>(Endpoints.AI_CHAT, {
      messages: history,
      tools,
      model,
    });

    history = [...history, { role: 'assistant', turns: data.turns, model }];

    const toolCalls = data.turns.filter(
      (turn): turn is Extract<AiTurn, { type: 'tool_call' }> => turn.type === 'tool_call',
    );
    if (toolCalls.length === 0) {
      return history;
    }

    const toolResults = await Promise.all(
      toolCalls.map(async (call) => {
        const result = await toolRegistry.execute(call.toolName, call.toolInput);
        return { role: 'tool_result' as const, toolCallId: call.toolCallId, result };
      }),
    );
    history = [...history, ...toolResults];
  }

  throw new Error(
    `AI conversation exceeded ${MAX_TOOL_ROUNDS} tool-call rounds without a final reply.`,
  );
};
