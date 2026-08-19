import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~root/components/ui';
import { UUIDCase, UUIDVersion } from '~root/constants';
import type { QuantityValidation } from '~root/utils';

type Props = {
  version: UUIDVersion;
  onVersionChange: (version: UUIDVersion) => void;
  quantity: string;
  onQuantityChange: (value: string) => void;
  quantityValidation: QuantityValidation;
  caseOption: UUIDCase;
  onCaseChange: (value: UUIDCase) => void;
  removeHyphens: boolean;
  onRemoveHyphensChange: (value: boolean) => void;
  onGenerate: () => void;
};

export const ConfigPanel = ({
  version,
  onVersionChange,
  quantity,
  onQuantityChange,
  quantityValidation,
  caseOption,
  onCaseChange,
  removeHyphens,
  onRemoveHyphensChange,
  onGenerate,
}: Props) => {
  const { t } = useTranslation('uuid-generator');

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t('config.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="uuid-version">{t('config.versionLabel')}</Label>
          <Select value={version} onValueChange={(value) => onVersionChange(value as UUIDVersion)}>
            <SelectTrigger id="uuid-version" className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="v4">{t('config.versionV4')}</SelectItem>
              <SelectItem value="v7">{t('config.versionV7')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {version === 'v7' ? t('config.versionV7Description') : t('config.versionV4Description')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="uuid-quantity">{t('config.quantityLabel')}</Label>
          <Input
            id="uuid-quantity"
            inputMode="numeric"
            autoComplete="off"
            value={quantity}
            onChange={(event) => onQuantityChange(event.target.value)}
            aria-invalid={!quantityValidation.valid}
            aria-describedby={!quantityValidation.valid ? 'uuid-quantity-error' : undefined}
            className="w-full sm:w-32"
          />
          {!quantityValidation.valid && (
            <p id="uuid-quantity-error" role="alert" className="text-xs text-destructive">
              {t(`config.quantityError.${quantityValidation.reason}`)}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <span className="text-sm font-medium">{t('config.formatLabel')}</span>
          <RadioGroup
            value={caseOption}
            onValueChange={(value) => onCaseChange(value as UUIDCase)}
            className="flex flex-row flex-wrap gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="lower" id="uuid-case-lower" />
              <Label htmlFor="uuid-case-lower" className="font-normal">
                {t('config.caseLower')}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="upper" id="uuid-case-upper" />
              <Label htmlFor="uuid-case-upper" className="font-normal">
                {t('config.caseUpper')}
              </Label>
            </div>
          </RadioGroup>
          <div className="flex items-center gap-2">
            <Checkbox
              id="uuid-remove-hyphens"
              checked={removeHyphens}
              onCheckedChange={(checked) => onRemoveHyphensChange(checked === true)}
            />
            <Label htmlFor="uuid-remove-hyphens" className="font-normal">
              {t('config.removeHyphens')}
            </Label>
          </div>
        </div>

        <Button
          type="button"
          onClick={onGenerate}
          disabled={!quantityValidation.valid}
          className="w-full sm:w-auto"
        >
          <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('config.generate')}
        </Button>
      </CardContent>
    </Card>
  );
};
