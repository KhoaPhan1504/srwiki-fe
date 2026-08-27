import { useState } from 'react';
import { PanelLeft, PanelLeftClose, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~root/components/ui/button';
import { useListConversations } from '~root/apis/useListConversations';
import { useDeleteConversation } from '~root/apis/useDeleteConversation';
import { ConversationListItem } from './ConversationListItem';

type Props = {
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
};

const MOBILE_BREAKPOINT_PX = 768;

export const ConversationSidebar = ({ activeConversationId, onSelect, onNewChat }: Props) => {
  const { t } = useTranslation('ai-assistant');
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < MOBILE_BREAKPOINT_PX);
  const { conversations } = useListConversations();
  const deleteConversation = useDeleteConversation();

  if (collapsed) {
    return (
      <div className="flex w-12 shrink-0 flex-col items-center gap-2 border-r py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          aria-label={t('sidebar.expand')}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-64 shrink-0 flex-col border-r">
      <div className="flex items-center justify-between gap-1 p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onNewChat}
          className="flex-1 justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('sidebar.newChat')}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(true)}
          aria-label={t('sidebar.collapse')}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeConversationId}
            onSelect={() => onSelect(conversation.id)}
            onDelete={() =>
              deleteConversation.mutate(conversation.id, {
                onSuccess: () => {
                  if (conversation.id === activeConversationId) onNewChat();
                },
              })
            }
          />
        ))}
      </div>
    </div>
  );
};
