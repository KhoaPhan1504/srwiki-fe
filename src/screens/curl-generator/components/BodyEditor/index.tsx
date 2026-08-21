import { useTranslation } from 'react-i18next';
import { Badge, Textarea } from '~root/components/ui';
import { isJsonString } from '~root/utils';

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const BodyEditor = ({ value, onChange, disabled }: Props) => {
  const { t } = useTranslation('curl-generator');
  const trimmed = value.trim();
  const showValidity = !disabled && trimmed !== '';
  const valid = showValidity && isJsonString(trimmed);

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('request.body.placeholder')}
        disabled={disabled}
        spellCheck={false}
        className="min-h-48 font-mono text-sm"
      />
      {disabled ? (
        <p className="text-xs text-muted-foreground">{t('request.body.disabledForGet')}</p>
      ) : showValidity ? (
        <Badge variant={valid ? 'outline' : 'destructive'}>
          {valid ? t('request.body.validJson') : t('request.body.invalidJson')}
        </Badge>
      ) : null}
    </div>
  );
};
