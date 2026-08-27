import { MessageBubble } from '../MessageBubble';

const DOT_DELAYS_MS = [0, 150, 300];

export const TypingIndicator = () => (
  <MessageBubble align="left">
    <div className="flex items-center gap-1 py-0.5" data-testid="typing-indicator">
      {DOT_DELAYS_MS.map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  </MessageBubble>
);
