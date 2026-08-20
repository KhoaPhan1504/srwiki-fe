import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~root/components/ui';
import { ToolPanel } from '~root/components/tools';
import { UNIT_OPTIONS_BY_CATEGORY, UnitCategory } from '~root/constants';

type Props = {
  category: UnitCategory;
  unit: string;
  input: string;
  baseFontSizePx: string;
  onUnitChange: (unit: string) => void;
  onInputChange: (value: string) => void;
  onBaseFontSizePxChange: (value: string) => void;
  onClear: () => void;
};

export const InputPanel = ({
  category,
  unit,
  input,
  baseFontSizePx,
  onUnitChange,
  onInputChange,
  onBaseFontSizePxChange,
  onClear,
}: Props) => {
  const { t } = useTranslation('unit-converter');
  const unitOptions = UNIT_OPTIONS_BY_CATEGORY[category];

  return (
    <ToolPanel title={t('input.title')}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="unit-converter-unit">{t('input.unitLabel')}</Label>
          <Select value={unit} onValueChange={onUnitChange}>
            <SelectTrigger id="unit-converter-unit" className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit-converter-input">{t('input.valueLabel')}</Label>
          <Input
            id="unit-converter-input"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={t('input.placeholder')}
            spellCheck={false}
            autoComplete="off"
            inputMode="decimal"
            className="font-mono text-sm"
          />
        </div>

        {category === UnitCategory.LENGTH && (
          <div className="space-y-2">
            <Label htmlFor="unit-converter-base-font-size">{t('input.baseFontSizeLabel')}</Label>
            <Input
              id="unit-converter-base-font-size"
              value={baseFontSizePx}
              onChange={(event) => onBaseFontSizePxChange(event.target.value)}
              inputMode="decimal"
              autoComplete="off"
              className="w-full font-mono text-sm sm:w-32"
            />
            <p className="text-xs text-muted-foreground">{t('input.baseFontSizeHint')}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" disabled={!input}>
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('input.clear')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('input.clearConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('input.clearConfirmDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={onClear}>
                  {t('input.clear')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </ToolPanel>
  );
};
