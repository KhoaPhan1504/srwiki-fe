import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~root/components/ui/button';
import { cn } from '~root/lib/utils';
import type { ConversationSummary } from '~root/apis/useListConversations';

type Props = {
  conversation: ConversationSummary;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

export const ConversationListItem = ({ conversation, active, onSelect, onDelete }: Props) => {
  const { t } = useTranslation('ai-assistant');

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect();
      }}
      className={cn(
        'group flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm',
        active ? 'bg-muted' : 'hover:bg-muted/50',
      )}
    >
      <span className="truncate">{conversation.title}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
        aria-label={t('sidebar.delete')}
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
