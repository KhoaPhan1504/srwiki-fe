import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '~root/lib/http-client';
import { toolRegistry } from '~root/ai-tools';
import { continueConversation } from './client';
import type { AiMessage } from './client';

vi.mock('~root/lib/http-client', () => ({
  httpClient: { post: vi.fn() },
}));

interface RequestBody {
  messages: AiMessage[];
  tools: unknown[];
  model: string;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(httpClient.post).mockReset();
});

describe('continueConversation', () => {
  it('returns history with the assistant reply appended when there is no tool call', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: { turns: [{ type: 'reply', content: 'Hello!' }] },
    });

    const messages: AiMessage[] = [{ role: 'user', content: 'hi' }];
    const result = await continueConversation(messages, 'gemini-3.6-flash');

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { role: 'user', content: 'hi' },
      {
        role: 'assistant',
        turns: [{ type: 'reply', content: 'Hello!' }],
        model: 'gemini-3.6-flash',
      },
    ]);
  });

  it('sends the given model in the request body', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: { turns: [{ type: 'reply', content: 'Hello!' }] },
    });

    await continueConversation([{ role: 'user', content: 'hi' }], 'claude-opus-5');

    const body = vi.mocked(httpClient.post).mock.calls[0][1] as RequestBody;
    expect(body.model).toBe('claude-opus-5');
  });

  it('executes a tool call and sends the result back, then returns the final reply', async () => {
    vi.mocked(httpClient.post)
      .mockResolvedValueOnce({
        data: {
          turns: [
            {
              type: 'tool_call',
              toolCallId: 'call-1',
              toolName: 'generate_uuid',
              toolInput: { version: 'v4' },
              providerData: 'sig-abc',
            },
          ],
        },
      })
      .mockResolvedValueOnce({ data: { turns: [{ type: 'reply', content: 'Done!' }] } });

    const executeSpy = vi
      .spyOn(toolRegistry, 'execute')
      .mockResolvedValue({ success: true, data: { uuid: 'fake-uuid' } });

    const messages: AiMessage[] = [{ role: 'user', content: 'generate a uuid' }];
    const result = await continueConversation(messages, 'gemini-3.6-flash');

    expect(httpClient.post).toHaveBeenCalledTimes(2);
    expect(executeSpy).toHaveBeenCalledWith('generate_uuid', { version: 'v4' });

    const secondCallBody = vi.mocked(httpClient.post).mock.calls[1][1] as RequestBody;
    expect(secondCallBody.messages).toContainEqual({
      role: 'tool_result',
      toolCallId: 'call-1',
      result: { success: true, data: { uuid: 'fake-uuid' } },
    });
    // The tool_call turn's providerData (Gemini's thought_signature) must survive
    // the round trip into the next request's history unchanged, or a resent
    // Gemini tool call will fail with a 400 on the real API.
    const resentAssistantMessage = secondCallBody.messages.find(
      (m): m is Extract<AiMessage, { role: 'assistant' }> => m.role === 'assistant',
    );
    expect(resentAssistantMessage?.turns[0]).toMatchObject({ providerData: 'sig-abc' });
    expect(result.at(-1)).toEqual({
      role: 'assistant',
      turns: [{ type: 'reply', content: 'Done!' }],
      model: 'gemini-3.6-flash',
    });
  });

  it('executes multiple parallel tool calls in one round', async () => {
    vi.mocked(httpClient.post)
      .mockResolvedValueOnce({
        data: {
          turns: [
            { type: 'tool_call', toolCallId: 'call-1', toolName: 'generate_uuid', toolInput: {} },
            {
              type: 'tool_call',
              toolCallId: 'call-2',
              toolName: 'encode_base64',
              toolInput: { text: 'hi' },
            },
          ],
        },
      })
      .mockResolvedValueOnce({ data: { turns: [{ type: 'reply', content: 'ok' }] } });

    vi.spyOn(toolRegistry, 'execute').mockResolvedValue({ success: true, data: {} });

    await continueConversation([{ role: 'user', content: 'do 2 things' }], 'gemini-3.6-flash');

    const secondCallBody = vi.mocked(httpClient.post).mock.calls[1][1] as RequestBody;
    const toolResultIds = secondCallBody.messages
      .filter(
        (message): message is Extract<AiMessage, { role: 'tool_result' }> =>
          message.role === 'tool_result',
      )
      .map((message) => message.toolCallId);
    expect(toolResultIds.sort()).toEqual(['call-1', 'call-2']);
  });

  it('throws after exceeding the tool-call round limit without a final reply', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: {
        turns: [
          { type: 'tool_call', toolCallId: 'call-x', toolName: 'generate_uuid', toolInput: {} },
        ],
      },
    });
    vi.spyOn(toolRegistry, 'execute').mockResolvedValue({ success: true, data: {} });

    await expect(
      continueConversation([{ role: 'user', content: 'loop forever' }], 'gemini-3.6-flash'),
    ).rejects.toThrow(/exceeded/);
  });
});
