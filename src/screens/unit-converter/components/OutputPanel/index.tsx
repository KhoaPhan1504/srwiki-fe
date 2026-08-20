import { CircleX, Ruler } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CopyButton, ToolPanel } from '~root/components/tools';
import {
  DATA_UNITS,
  ErrorCodes,
  LENGTH_UNITS,
  TEMPERATURE_UNITS,
  TIME_UNITS,
  UnitCategory,
} from '~root/constants';
import type { UnitConversionResult, UnitOption } from '~root/types';
import { formatUnitValue } from '~root/utils';

type Props = {
  result: UnitConversionResult | null;
};

type Row = { key: string; label: string; value: string };

const ERROR_DESCRIPTION_KEY: Partial<Record<ErrorCodes, string>> = {
  [ErrorCodes.INVALID_NUMBER]: 'output.invalidNumberDescription',
  [ErrorCodes.NEGATIVE_NOT_ALLOWED]: 'output.negativeNotAllowedDescription',
  [ErrorCodes.BELOW_ABSOLUTE_ZERO]: 'output.belowAbsoluteZeroDescription',
};

const buildRowsForUnits = <U extends string>(
  units: UnitOption<U>[],
  values: Record<U, number>,
  t: (key: string) => string,
): Row[] =>
  units.map((option) => ({
    key: option.value,
    label: t(option.labelKey),
    value: formatUnitValue(values[option.value]),
  }));

const buildRows = (result: UnitConversionResult, t: (key: string) => string): Row[] => {
  if (!result.success) return [];

  switch (result.category) {
    case UnitCategory.LENGTH:
      return buildRowsForUnits(LENGTH_UNITS, result.values, t);
    case UnitCategory.DATA:
      return buildRowsForUnits(DATA_UNITS, result.values, t);
    case UnitCategory.TIME:
      return buildRowsForUnits(TIME_UNITS, result.values, t);
    case UnitCategory.TEMPERATURE:
      return buildRowsForUnits(TEMPERATURE_UNITS, result.values, t);
  }
};

export const OutputPanel = ({ result }: Props) => {
  const { t } = useTranslation('unit-converter');
  const rows = result ? buildRows(result, t) : [];

  return (
    <ToolPanel title={t('output.title')}>
      {result && !result.success ? (
        <div
          role="alert"
          className="flex h-64 flex-col items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-center text-sm"
        >
          <CircleX className="h-8 w-8 text-destructive" aria-hidden="true" />
          <p className="font-medium text-destructive">{t('output.invalidTitle')}</p>
          <p className="max-w-sm text-muted-foreground">
            {t(ERROR_DESCRIPTION_KEY[result.error.code] ?? 'output.invalidNumberDescription')}
          </p>
        </div>
      ) : rows.length > 0 ? (
        <ul className="divide-y rounded-md border">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="truncate font-mono text-sm">{row.value}</p>
              </div>
              <CopyButton
                value={row.value}
                label={`${t('output.copy')} ${row.label}`}
                copiedLabel={`${t('output.copied')} ${row.label}`}
                errorMessage={t('output.copyError')}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-sm text-muted-foreground">
          <Ruler className="h-8 w-8 opacity-50" aria-hidden="true" />
          <p>{t('output.empty')}</p>
        </div>
      )}
    </ToolPanel>
  );
};
