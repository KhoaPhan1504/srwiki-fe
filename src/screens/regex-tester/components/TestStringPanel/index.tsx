import { useTranslation } from 'react-i18next';
import { Textarea } from '~root/components/ui';
import { ToolPanel } from '~root/components/tools';
import { TEST_STRING_WARN_LENGTH } from '~root/constants';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const TestStringPanel = ({ value, onChange }: Props) => {
  const { t } = useTranslation('regex-tester');

  return (
    <ToolPanel
      title={t('testString.title')}
      headerActions={
        <span className="text-xs text-muted-foreground">
          {t('testString.charCount', { count: value.length })}
        </span>
      }
    >
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('testString.placeholder')}
        spellCheck={false}
        aria-label={t('testString.title')}
        className="h-48 resize-y font-mono text-sm"
      />
      {value.length > TEST_STRING_WARN_LENGTH && (
        <p role="status" className="mt-2 text-xs text-muted-foreground">
          {t('testString.largeInputWarning')}
        </p>
      )}
    </ToolPanel>
  );
};
