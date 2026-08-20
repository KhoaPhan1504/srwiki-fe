import { CircleX, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CopyButton, ToolPanel } from '~root/components/tools';
import { ErrorCodes } from '~root/constants';
import type { ColorConversionResult } from '~root/types';

type Props = {
  result: ColorConversionResult | null;
};

type Row = { key: string; label: string; value: string };

const ERROR_DESCRIPTION_KEY: Partial<Record<ErrorCodes, string>> = {
  [ErrorCodes.INVALID_HEX]: 'output.invalidHexDescription',
  [ErrorCodes.INVALID_RGB]: 'output.invalidRgbDescription',
  [ErrorCodes.INVALID_HSL]: 'output.invalidHslDescription',
  [ErrorCodes.INVALID_COLOR_FORMAT]: 'output.invalidFormatDescription',
};

export const OutputPanel = ({ result }: Props) => {
  const { t } = useTranslation('color-converter');

  const rows: Row[] = result?.success
    ? [
        { key: 'hex', label: t('output.hex'), value: result.color.hex },
        { key: 'rgb', label: t('output.rgb'), value: result.color.rgbString },
        { key: 'hsl', label: t('output.hsl'), value: result.color.hslString },
      ]
    : [];

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
            {t(ERROR_DESCRIPTION_KEY[result.error.code] ?? 'output.invalidFormatDescription')}
          </p>
        </div>
      ) : result?.success ? (
        <div className="space-y-4">
          <div
            className="h-16 w-full rounded-md border"
            style={{ backgroundColor: result.color.hex }}
            role="img"
            aria-label={t('output.previewAlt', { hex: result.color.hex })}
          />
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
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-sm text-muted-foreground">
          <Palette className="h-8 w-8 opacity-50" aria-hidden="true" />
          <p>{t('output.empty')}</p>
        </div>
      )}
    </ToolPanel>
  );
};
