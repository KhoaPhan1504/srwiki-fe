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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '~root/components/ui';
import { TimestampConversionMode, TimestampUnit } from '~root/constants';
import type { TimezoneMode } from '~root/constants';

type Props = {
  mode: TimestampConversionMode;
  input: string;
  unit: TimestampUnit;
  timezoneMode: TimezoneMode;
  onInputChange: (value: string) => void;
  onUnitChange: (unit: TimestampUnit) => void;
  onTimezoneModeChange: (mode: TimezoneMode) => void;
  onClear: () => void;
};

export const InputPanel = ({
  mode,
  input,
  unit,
  timezoneMode,
  onInputChange,
  onUnitChange,
  onTimezoneModeChange,
  onClear,
}: Props) => {
  const { t } = useTranslation('timestamp-converter');
  const isTimestampToDate = mode === TimestampConversionMode.TIMESTAMP_TO_DATE;

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="space-y-0">
        <CardTitle className="text-sm font-medium">{t('input.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTimestampToDate ? (
          <div className="space-y-3">
            <span className="text-sm font-medium">{t('input.unitLabel')}</span>
            <RadioGroup
              value={unit}
              onValueChange={(value) => onUnitChange(value as TimestampUnit)}
              className="flex flex-row flex-wrap gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value={TimestampUnit.SECONDS} id="timestamp-unit-seconds" />
                <Label htmlFor="timestamp-unit-seconds" className="font-normal">
                  {t('input.unitSeconds')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value={TimestampUnit.MILLISECONDS}
                  id="timestamp-unit-milliseconds"
                />
                <Label htmlFor="timestamp-unit-milliseconds" className="font-normal">
                  {t('input.unitMilliseconds')}
                </Label>
              </div>
            </RadioGroup>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-sm font-medium">{t('input.timezoneLabel')}</span>
            <RadioGroup
              value={timezoneMode}
              onValueChange={(value) => onTimezoneModeChange(value as TimezoneMode)}
              className="flex flex-row flex-wrap gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="local" id="timestamp-timezone-local" />
                <Label htmlFor="timestamp-timezone-local" className="font-normal">
                  {t('input.timezoneLocal')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="UTC" id="timestamp-timezone-utc" />
                <Label htmlFor="timestamp-timezone-utc" className="font-normal">
                  {t('input.timezoneUtc')}
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="timestamp-converter-input">
            {isTimestampToDate ? t('input.timestampLabel') : t('input.dateLabel')}
          </Label>
          <Input
            id="timestamp-converter-input"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={t(
              isTimestampToDate ? 'input.placeholderTimestamp' : 'input.placeholderDate',
            )}
            spellCheck={false}
            autoComplete="off"
            inputMode={isTimestampToDate ? 'decimal' : 'text'}
            className="font-mono text-sm"
          />
        </div>

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
      </CardContent>
    </Card>
  );
};
