import { useTranslation } from 'react-i18next';
import { Button } from '~root/components/ui';
import { TOOLBAR_ACTIONS } from '~root/constants';
import type { ToolbarAction } from '~root/types';

type Props = {
  onAction: (action: ToolbarAction) => void;
};

export const Toolbar = ({ onAction }: Props) => {
  const { t } = useTranslation('markdown-preview');

  return (
    <div role="toolbar" className="flex flex-wrap items-center gap-1">
      {TOOLBAR_ACTIONS.map(({ action, icon: Icon, labelKey, shortcut }) => (
        <Button
          key={action}
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t(labelKey)}
          title={shortcut ? `${t(labelKey)} (${shortcut})` : t(labelKey)}
          onClick={() => onAction(action)}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </Button>
      ))}
    </div>
  );
};
