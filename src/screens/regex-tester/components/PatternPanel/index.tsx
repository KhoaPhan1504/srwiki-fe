import { useTranslation } from 'react-i18next';
import { Checkbox, Input, Label } from '~root/components/ui';
import { CopyButton, ToolPanel } from '~root/components/tools';
import { FLAG_DEFINITIONS } from '~root/constants';
import type { RegexError } from '~root/types';

type Props = {
  pattern: string;
  onPatternChange: (value: string) => void;
  flags: string;
  onToggleFlag: (flag: string) => void;
  syntaxError: RegexError | null;
};

export const PatternPanel = ({
  pattern,
  onPatternChange,
  flags,
  onToggleFlag,
  syntaxError,
}: Props) => {
  const { t } = useTranslation('regex-tester');
  const preview = `/${pattern}/${flags}`;

  return (
    <ToolPanel
      title={t('pattern.title')}
      headerActions={
        <CopyButton
          value={preview}
          label={t('pattern.copyPreview')}
          copiedLabel={t('pattern.copied')}
          errorMessage={t('pattern.copyError')}
          disabled={!pattern}
        />
      }
    >
      <div className="space-y-3">
        <div>
          <Label htmlFor="regex-pattern-input">{t('pattern.inputLabel')}</Label>
          <Input
            id="regex-pattern-input"
            value={pattern}
            onChange={(event) => onPatternChange(event.target.value)}
            placeholder={t('pattern.placeholder')}
            spellCheck={false}
            className="mt-1 font-mono"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          {FLAG_DEFINITIONS.map(({ flag, labelKey, descriptionKey }) => (
            <div key={flag} className="flex items-center gap-2" title={t(descriptionKey)}>
              <Checkbox
                id={`regex-flag-${flag}`}
                checked={flags.includes(flag)}
                onCheckedChange={() => onToggleFlag(flag)}
              />
              <Label htmlFor={`regex-flag-${flag}`} className="font-mono text-sm">
                {t(labelKey)}
              </Label>
            </div>
          ))}
        </div>
        <p className="rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm text-muted-foreground">
          {preview}
        </p>
        {syntaxError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <p className="font-medium">{t('pattern.invalidTitle')}</p>
            <p>{syntaxError.message}</p>
          </div>
        )}
      </div>
    </ToolPanel>
  );
};
