import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { continueConversation } from '~root/ai-tools/client';
import type { AiMessage } from '~root/ai-tools/client';
import { useCreateConversation } from '~root/apis/useCreateConversation';
import { useGetConversation } from '~root/apis/useGetConversation';
import { useAppendMessages } from '~root/apis/useAppendMessages';
import { useListModels } from '~root/apis/useListModels';

export const useAiAssistantHooks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationId = searchParams.get('c');

  const { data: conversation } = useGetConversation(conversationId);
  const { models } = useListModels();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [syncedConversationId, setSyncedConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [modelsDefaulted, setModelsDefaulted] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversation = useCreateConversation();
  const appendMessages = useAppendMessages();

  // Default the model picker to Gemini (falling back to whatever's first
  // available) exactly once, the first render after the model list loads —
  // guarded so it never overwrites a choice the user (or the conversation
  // sync below) already made.
  if (!modelsDefaulted && models.length > 0) {
    setModelsDefaulted(true);
    const geminiModel = models.find((model) => model.provider === 'gemini');
    setSelectedModel(geminiModel?.id ?? models[0].id);
  }

  // Re-hydrate `messages` from the server only once, exactly when the
  // *fetched* conversation matches the currently-selected id. Adjusting state
  // during render (React's documented pattern for "derive state from a
  // changed id") instead of in a useEffect — an effect that calls setState
  // synchronously causes an extra commit-then-rerender pass and is flagged by
  // this repo's react-hooks/set-state-in-effect lint rule. This also avoids a
  // flash-to-empty right after creating a conversation: on that render
  // `conversation` (the query result for the brand-new id) is still
  // undefined, so this guard simply does nothing and the messages already set
  // by sendMessage's own setMessages(updated) call stay on screen.
  if (
    conversation &&
    conversation.id === conversationId &&
    syncedConversationId !== conversationId
  ) {
    setSyncedConversationId(conversationId);
    setMessages(conversation.messages.map((message) => message.payload));

    // Resume with whichever model most recently replied in this conversation
    // (free to differ per message — the user can switch mid-conversation),
    // rather than leaving the picker on the app-wide default.
    const lastAssistantModel = [...conversation.messages]
      .reverse()
      .map((message) => message.payload)
      .find(
        (payload): payload is Extract<AiMessage, { role: 'assistant' }> =>
          payload.role === 'assistant',
      )?.model;
    if (lastAssistantModel) {
      setSelectedModel(lastAssistantModel);
    }
  }

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !selectedModel) return;

    const baseMessages = messages;
    const userMessage: AiMessage = { role: 'user', content: trimmed };
    const nextMessages = [...baseMessages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const created = await createConversation.mutateAsync({ title: trimmed.slice(0, 50) });
        activeConversationId = created.id;
      }

      const updated = await continueConversation(nextMessages, selectedModel);
      setMessages(updated);

      const newMessages = updated.slice(baseMessages.length);
      await appendMessages.mutateAsync({
        conversationId: activeConversationId,
        messages: newMessages,
      });

      if (!conversationId) {
        setSyncedConversationId(activeConversationId);
        setSearchParams({ c: activeConversationId });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setSearchParams({});
    setMessages([]);
    setError(null);
  };

  const selectConversation = (id: string) => {
    setSearchParams({ c: id });
  };

  return {
    conversationId,
    messages,
    input,
    setInput,
    isLoading,
    error,
    models,
    selectedModel,
    setSelectedModel,
    sendMessage,
    startNewChat,
    selectConversation,
  };
};
