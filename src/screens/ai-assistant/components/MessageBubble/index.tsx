import type { ReactNode } from 'react';
import { cn } from '~root/lib/utils';

type Props = {
  align: 'left' | 'right';
  children: ReactNode;
};

export const MessageBubble = ({ align, children }: Props) => (
  <div className={cn('flex', align === 'right' ? 'justify-end' : 'justify-start')}>
    <div
      className={cn(
        'max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm',
        align === 'right' ? 'bg-primary text-primary-foreground' : 'bg-muted',
      )}
    >
      {children}
    </div>
  </div>
);
