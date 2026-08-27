import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

const {
  continueConversationMock,
  createConversationMutateAsyncMock,
  appendMessagesMutateAsyncMock,
  useGetConversationMock,
  useListModelsMock,
} = vi.hoisted(() => ({
  continueConversationMock: vi.fn(),
  createConversationMutateAsyncMock: vi.fn(),
  appendMessagesMutateAsyncMock: vi.fn(),
  useGetConversationMock: vi.fn(),
  useListModelsMock: vi.fn(),
}));

vi.mock('~root/ai-tools/client', () => ({
  continueConversation: continueConversationMock,
}));

vi.mock('~root/apis/useCreateConversation', () => ({
  useCreateConversation: () => ({ mutateAsync: createConversationMutateAsyncMock }),
}));

vi.mock('~root/apis/useAppendMessages', () => ({
  useAppendMessages: () => ({ mutateAsync: appendMessagesMutateAsyncMock }),
}));

vi.mock('~root/apis/useGetConversation', () => ({
  useGetConversation: useGetConversationMock,
}));

vi.mock('~root/apis/useListModels', () => ({
  useListModels: useListModelsMock,
}));

import { useAiAssistantHooks } from '.';

const wrapperAt = (path: string) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  );
  return Wrapper;
};

const THREE_MODELS = [
  { id: 'claude-opus-5', label: 'Claude Opus 5', provider: 'anthropic' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', provider: 'gemini' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', provider: 'gemini' },
];

afterEach(() => {
  continueConversationMock.mockReset();
  createConversationMutateAsyncMock.mockReset();
  appendMessagesMutateAsyncMock.mockReset();
  useGetConversationMock.mockReset();
  useListModelsMock.mockReset();
});

describe('useAiAssistantHooks', () => {
  it('creates a conversation and appends the full history on the first message', async () => {
    useGetConversationMock.mockReturnValue({ data: undefined });
    useListModelsMock.mockReturnValue({ models: THREE_MODELS, isLoading: false });
    createConversationMutateAsyncMock.mockResolvedValueOnce({
      id: 'conv-1',
      title: 'hi',
      createdAt: '',
      updatedAt: '',
    });
    continueConversationMock.mockResolvedValueOnce([
      { role: 'user', content: 'hi' },
      {
        role: 'assistant',
        turns: [{ type: 'reply', content: 'hello' }],
        model: 'gemini-3.6-flash',
      },
    ]);

    const { result } = renderHook(() => useAiAssistantHooks(), {
      wrapper: wrapperAt('/ai-assistant'),
    });

    act(() => result.current.setInput('hi'));
    await act(async () => {
      await result.current.sendMessage();
    });

    expect(createConversationMutateAsyncMock).toHaveBeenCalledWith({ title: 'hi' });
    expect(continueConversationMock).toHaveBeenCalledWith(
      [{ role: 'user', content: 'hi' }],
      'gemini-3.6-flash',
    );
    expect(appendMessagesMutateAsyncMock).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      messages: [
        { role: 'user', content: 'hi' },
        {
          role: 'assistant',
          turns: [{ type: 'reply', content: 'hello' }],
          model: 'gemini-3.6-flash',
        },
      ],
    });
  });

  it('reuses the selected conversation and only appends the newly generated messages', async () => {
    useGetConversationMock.mockReturnValue({
      data: {
        id: 'conv-1',
        title: 'hi',
        createdAt: '',
        updatedAt: '',
        messages: [{ id: 'm1', payload: { role: 'user', content: 'first' }, createdAt: '' }],
      },
    });
    useListModelsMock.mockReturnValue({ models: THREE_MODELS, isLoading: false });
    continueConversationMock.mockResolvedValueOnce([
      { role: 'user', content: 'first' },
      { role: 'user', content: 'second' },
      { role: 'assistant', turns: [{ type: 'reply', content: 'ok' }], model: 'gemini-3.6-flash' },
    ]);

    const { result } = renderHook(() => useAiAssistantHooks(), {
      wrapper: wrapperAt('/ai-assistant?c=conv-1'),
    });

    expect(result.current.messages).toEqual([{ role: 'user', content: 'first' }]);

    act(() => result.current.setInput('second'));
    await act(async () => {
      await result.current.sendMessage();
    });

    expect(createConversationMutateAsyncMock).not.toHaveBeenCalled();
    expect(appendMessagesMutateAsyncMock).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      messages: [
        { role: 'user', content: 'second' },
        {
          role: 'assistant',
          turns: [{ type: 'reply', content: 'ok' }],
          model: 'gemini-3.6-flash',
        },
      ],
    });
  });

  it('startNewChat clears the conversation id and messages', () => {
    useGetConversationMock.mockReturnValue({ data: undefined });
    useListModelsMock.mockReturnValue({ models: THREE_MODELS, isLoading: false });
    const { result } = renderHook(() => useAiAssistantHooks(), {
      wrapper: wrapperAt('/ai-assistant?c=conv-1'),
    });

    act(() => result.current.startNewChat());

    expect(result.current.conversationId).toBeNull();
    expect(result.current.messages).toEqual([]);
  });

  it('does not call continueConversation for empty or whitespace-only input', async () => {
    useGetConversationMock.mockReturnValue({ data: undefined });
    useListModelsMock.mockReturnValue({ models: THREE_MODELS, isLoading: false });
    const { result } = renderHook(() => useAiAssistantHooks(), {
      wrapper: wrapperAt('/ai-assistant'),
    });

    act(() => result.current.setInput('   '));
    await act(async () => {
      await result.current.sendMessage();
    });

    expect(continueConversationMock).not.toHaveBeenCalled();
  });

  it('defaults selectedModel to the first Gemini model once the model list loads', () => {
    useGetConversationMock.mockReturnValue({ data: undefined });
    useListModelsMock.mockReturnValue({ models: THREE_MODELS, isLoading: false });

    const { result } = renderHook(() => useAiAssistantHooks(), {
      wrapper: wrapperAt('/ai-assistant'),
    });

    expect(result.current.selectedModel).toBe('gemini-3.6-flash');
  });

  it("resumes a reopened conversation's last assistant model", () => {
    useListModelsMock.mockReturnValue({ models: THREE_MODELS, isLoading: false });
    useGetConversationMock.mockReturnValue({
      data: {
        id: 'conv-1',
        title: 'hi',
        createdAt: '',
        updatedAt: '',
        messages: [
          { id: 'm1', payload: { role: 'user', content: 'hi' }, createdAt: '' },
          {
            id: 'm2',
            payload: {
              role: 'assistant',
              turns: [{ type: 'reply', content: 'hello' }],
              model: 'claude-opus-5',
            },
            createdAt: '',
          },
        ],
      },
    });

    const { result } = renderHook(() => useAiAssistantHooks(), {
      wrapper: wrapperAt('/ai-assistant?c=conv-1'),
    });

    expect(result.current.selectedModel).toBe('claude-opus-5');
  });
});
