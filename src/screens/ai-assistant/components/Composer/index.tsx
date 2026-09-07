import type { KeyboardEvent } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Textarea } from '~root/components/ui';
import type { ModelOut } from '~root/apis/useListModels';
import { ModelSelector } from '../ModelSelector';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  models: ModelOut[];
  selectedModel: string | null;
  onModelChange: (modelId: string) => void;
};

export const Composer = ({
  value,
  onChange,
  onSend,
  disabled,
  models,
  selectedModel,
  onModelChange,
}: Props) => {
  const { t } = useTranslation('ai-assistant');

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  const sendDisabled = disabled || value.trim().length === 0;

  return (
    <div className="flex items-center gap-2 rounded-3xl border bg-card px-4 py-3 shadow-sm">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('composer.placeholder')}
        disabled={disabled}
        rows={1}
        className="min-h-0 flex-1 resize-none text-sm xl:text-xl border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <ModelSelector models={models} value={selectedModel} onChange={onModelChange} />
      <Button
        onClick={onSend}
        disabled={sendDisabled}
        size="icon"
        className="shrink-0 rounded-full"
        aria-label={t('composer.send')}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
};
