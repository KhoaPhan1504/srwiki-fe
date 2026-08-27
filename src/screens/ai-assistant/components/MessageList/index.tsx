import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import type { AiMessage } from '~root/ai-tools/client';
import { MessageBubble } from '../MessageBubble';
import { ToolCallChip } from '../ToolCallChip';
import { TypingIndicator } from '../TypingIndicator';

type Props = {
  messages: AiMessage[];
  isLoading?: boolean;
};

export const MessageList = ({ messages, isLoading = false }: Props) => {
  const { t } = useTranslation('ai-assistant');

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <Sparkles className="h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
        <p className="font-medium">{t('emptyState.title')}</p>
        <p className="text-sm text-muted-foreground">{t('emptyState.description')}</p>
      </div>
    );
  }

  const resultsByCallId = new Map<string, unknown>();
  messages.forEach((message) => {
    if (message.role === 'tool_result') {
      resultsByCallId.set(message.toolCallId, message.result);
    }
  });

  return (
    <div className="flex flex-col gap-3 py-4">
      {messages.map((message, index) => {
        if (message.role === 'user') {
          return (
            <MessageBubble key={index} align="right">
              {message.content}
            </MessageBubble>
          );
        }
        if (message.role === 'assistant') {
          return (
            <div key={index} className="flex flex-col gap-2">
              {message.turns.map((turn, turnIndex) =>
                turn.type === 'reply' ? (
                  <MessageBubble key={turnIndex} align="left">
                    {turn.content}
                  </MessageBubble>
                ) : (
                  <ToolCallChip
                    key={turnIndex}
                    toolName={turn.toolName}
                    toolInput={turn.toolInput}
                    result={resultsByCallId.get(turn.toolCallId)}
                  />
                ),
              )}
            </div>
          );
        }
        return null;
      })}
      {isLoading ? <TypingIndicator /> : null}
    </div>
  );
};
