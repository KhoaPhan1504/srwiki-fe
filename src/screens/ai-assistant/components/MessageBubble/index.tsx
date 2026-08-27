import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { renderMarkdownToSafeHtml } from '~root/utils/markdown-preview';
import { cn } from '~root/lib/utils';

type Props = {
  align: 'left' | 'right';
  children: ReactNode;
};

export const MessageBubble = ({ align, children }: Props) => {
  const isMarkdown = align === 'left' && typeof children === 'string';
  const html = useMemo(
    () => (isMarkdown ? renderMarkdownToSafeHtml(children as string) : null),
    [isMarkdown, children],
  );

  const bubbleClassName = cn(
    'max-w-[80%] rounded-lg px-3 py-2',
    align === 'right' ? 'bg-primary text-primary-foreground' : 'bg-muted',
    isMarkdown ? 'prose prose-sm dark:prose-invert' : 'text-sm whitespace-pre-wrap',
  );

  return (
    <div className={cn('flex', align === 'right' ? 'justify-end' : 'justify-start')}>
      {isMarkdown ? (
        <div
          className={bubbleClassName}
          // `html` comes from renderMarkdownToSafeHtml, which runs DOMPurify before this ever reaches the DOM.
          dangerouslySetInnerHTML={{ __html: html as string }}
        />
      ) : (
        <div className={bubbleClassName}>{children}</div>
      )}
    </div>
  );
};
