import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToolHeader } from '~root/components/tools/ToolHeader';
import { useAiAssistantHooks } from './hooks';
import { ConversationSidebar } from './components/ConversationSidebar';
import { MessageList } from './components/MessageList';
import { Composer } from './components/Composer';

export const AiAssistantScreen = () => {
  const { t } = useTranslation('ai-assistant');
  const {
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
  } = useAiAssistantHooks();

  return (
    <div className="flex h-full">
      <ConversationSidebar
        activeConversationId={conversationId}
        onSelect={selectConversation}
        onNewChat={startNewChat}
      />
      <div className="flex flex-1 flex-col overflow-hidden px-4">
        {messages.length === 0 ? (
          <div className="flex flex-1">
            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="flex w-full max-w-2xl flex-col gap-7">
                <ToolHeader title={t('title')} description={t('description')} icon={Sparkles} />
                <Composer
                  value={input}
                  onChange={setInput}
                  onSend={sendMessage}
                  disabled={isLoading}
                  models={models}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="scrollbar-hidden flex-1 overflow-y-auto">
              <MessageList messages={messages} isLoading={isLoading} />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
            <Composer
              value={input}
              onChange={setInput}
              onSend={sendMessage}
              disabled={isLoading}
              models={models}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        )}
      </div>
    </div>
  );
};
