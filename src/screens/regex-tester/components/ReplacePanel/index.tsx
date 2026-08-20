import { useTranslation } from 'react-i18next';
import { Button, Label, Textarea } from '~root/components/ui';
import { CopyButton, ToolPanel } from '~root/components/tools';

type Props = {
  replacement: string;
  onReplacementChange: (value: string) => void;
  replacePreview: string;
  hasSyntaxError: boolean;
  testStringEmpty: boolean;
  onReplaceAll: () => void;
};

export const ReplacePanel = ({
  replacement,
  onReplacementChange,
  replacePreview,
  hasSyntaxError,
  testStringEmpty,
  onReplaceAll,
}: Props) => {
  const { t } = useTranslation('regex-tester');

  return (
    <ToolPanel title={t('replace.title')}>
      <div className="space-y-3">
        <div>
          <Label htmlFor="regex-replacement-input">{t('replace.inputLabel')}</Label>
          <Textarea
            id="regex-replacement-input"
            value={replacement}
            onChange={(event) => onReplacementChange(event.target.value)}
            placeholder={t('replace.placeholder')}
            spellCheck={false}
            className="mt-1 h-20 resize-y font-mono text-sm"
          />
        </div>
        <div>
          <p className="text-sm font-medium">{t('replace.previewTitle')}</p>
          <pre className="mt-1 max-h-48 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm whitespace-pre-wrap">
            {replacePreview}
          </pre>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={onReplaceAll} disabled={hasSyntaxError || testStringEmpty}>
            {t('replace.replaceAll')}
          </Button>
          <CopyButton
            value={replacePreview}
            label={t('replace.copyResult')}
            copiedLabel={t('replace.copied')}
            errorMessage={t('replace.copyError')}
            disabled={!replacePreview}
          />
        </div>
      </div>
    </ToolPanel>
  );
};
