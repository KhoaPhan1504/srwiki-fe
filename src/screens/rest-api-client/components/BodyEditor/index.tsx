import { useTranslation } from 'react-i18next';
import { Badge, Label, RadioGroup, RadioGroupItem, Textarea } from '~root/components/ui';
import { BODY_TYPES } from '~root/constants';
import type { BodyType, KeyValuePair } from '~root/types';
import { isJsonString } from '~root/utils';
import { KeyValueEditor } from '../KeyValueEditor';

type Props = {
  value: string;
  onChange: (value: string) => void;
  bodyType: BodyType;
  onBodyTypeChange: (bodyType: BodyType) => void;
  bodyFields: KeyValuePair[];
  onAddBodyField: () => void;
  onUpdateBodyField: (id: string, patch: Partial<KeyValuePair>) => void;
  onRemoveBodyField: (id: string) => void;
  disabled?: boolean;
};

export const BodyEditor = ({
  value,
  onChange,
  bodyType,
  onBodyTypeChange,
  bodyFields,
  onAddBodyField,
  onUpdateBodyField,
  onRemoveBodyField,
  disabled,
}: Props) => {
  const { t } = useTranslation('rest-api-client');
  const trimmed = value.trim();
  const showValidity = !disabled && bodyType === 'raw' && trimmed !== '';
  const valid = showValidity && isJsonString(trimmed);

  return (
    <div className="space-y-4">
      <RadioGroup
        value={bodyType}
        onValueChange={(next) => onBodyTypeChange(next as BodyType)}
        disabled={disabled}
        className="flex flex-row flex-wrap gap-4"
      >
        {BODY_TYPES.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <RadioGroupItem value={type} id={`rest-api-client-body-type-${type}`} />
            <Label htmlFor={`rest-api-client-body-type-${type}`} className="font-normal">
              {t(`request.body.types.${type}`)}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {bodyType === 'raw' ? (
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
      ) : (
        <KeyValueEditor
          rows={bodyFields}
          onAdd={onAddBodyField}
          onUpdate={onUpdateBodyField}
          onRemove={onRemoveBodyField}
          keyPlaceholder={t('request.body.fields.keyPlaceholder')}
          valuePlaceholder={t('request.body.fields.valuePlaceholder')}
          addLabel={t('request.body.fields.add')}
          removeLabel={t('request.body.fields.remove')}
          enabledLabel={t('request.rowEnabled')}
          emptyLabel={t('request.body.fields.empty')}
        />
      )}
    </div>
  );
};
