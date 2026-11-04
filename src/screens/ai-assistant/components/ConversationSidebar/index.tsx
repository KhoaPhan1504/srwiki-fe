import { useState } from 'react';
import { PanelLeft, PanelLeftClose, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~root/components/ui';
import { useListConversations, useDeleteConversation } from '~root/apis';
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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
    <div className="flex w-48 xl:w-64 shrink-0 flex-col border-r">
      <div className="flex items-center justify-between gap-1 p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onNewChat}
          className="w-auto justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          <p className="hidden xl:block">{t('sidebar.newChat')}</p>
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
            onDelete={() => setPendingDeleteId(conversation.id)}
          />
        ))}
      </div>
      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sidebar.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('sidebar.deleteConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const conversationId = pendingDeleteId;
                if (conversationId) {
                  deleteConversation.mutate(conversationId, {
                    onSuccess: () => {
                      if (conversationId === activeConversationId) onNewChat();
                    },
                  });
                }
                setPendingDeleteId(null);
              }}
            >
              {t('sidebar.deleteConfirmAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
