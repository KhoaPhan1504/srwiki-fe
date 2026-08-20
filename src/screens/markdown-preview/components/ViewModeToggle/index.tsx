import { Columns2, Eye, PenLine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~root/components/ui';
import { cn } from '~root/lib/utils';
import type { MarkdownViewMode } from '~root/types';

type Props = {
  value: MarkdownViewMode;
  onChange: (mode: MarkdownViewMode) => void;
};

const MODES: Array<{ mode: MarkdownViewMode; labelKey: string; icon: LucideIcon }> = [
  { mode: 'editor', labelKey: 'viewMode.editor', icon: PenLine },
  { mode: 'split', labelKey: 'viewMode.split', icon: Columns2 },
  { mode: 'preview', labelKey: 'viewMode.preview', icon: Eye },
];

export const ViewModeToggle = ({ value, onChange }: Props) => {
  const { t } = useTranslation('markdown-preview');

  return (
    <div role="group" className="inline-flex items-center gap-1 rounded-lg bg-muted p-[3px]">
      {MODES.map(({ mode, labelKey, icon: Icon }) => {
        const active = value === mode;
        return (
          <Button
            key={mode}
            type="button"
            size="sm"
            variant={active ? 'default' : 'ghost'}
            aria-pressed={active}
            className={cn(!active && 'text-foreground/60')}
            onClick={() => onChange(mode)}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {t(labelKey)}
          </Button>
        );
      })}
    </div>
  );
};
