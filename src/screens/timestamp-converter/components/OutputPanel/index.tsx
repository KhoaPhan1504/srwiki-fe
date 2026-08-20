import { Check, CircleX, Clock, Copy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Button, Card, CardContent, CardHeader, CardTitle } from '~root/components/ui';
import { ErrorCodes, TimestampConversionMode } from '~root/constants';
import type { Language } from '~root/constants';
import { getIntlLocaleTag } from '~root/i18n/dateLocale';
import type { DateToTimestampResult, TimestampToDateResult } from '~root/types';

type Props = {
  mode: TimestampConversionMode;
  timestampToDateResult: TimestampToDateResult | null;
  dateToTimestampResult: DateToTimestampResult | null;
};

type Row = { label: string; value: string };

const buildRows = (
  isTimestampToDate: boolean,
  result: TimestampToDateResult | DateToTimestampResult,
  locale: string,
  localZoneLabel: string,
  t: (key: string, options?: Record<string, unknown>) => string,
): Row[] => {
  if (!result.success) return [];

  if (isTimestampToDate && 'date' in result) {
    return [
      {
        label: t('output.local', { zone: localZoneLabel }),
        value: new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'medium' }).format(
          result.date,
        ),
      },
      {
        label: t('output.utc'),
        value: new Intl.DateTimeFormat(locale, {
          dateStyle: 'long',
          timeStyle: 'medium',
          timeZone: 'UTC',
        }).format(result.date),
      },
      { label: t('output.iso'), value: result.date.toISOString() },
    ];
  }

  if (!isTimestampToDate && 'seconds' in result) {
    return [
      { label: t('output.seconds'), value: String(result.seconds) },
      { label: t('output.milliseconds'), value: String(result.milliseconds) },
    ];
  }

  return [];
};

export const OutputPanel = ({ mode, timestampToDateResult, dateToTimestampResult }: Props) => {
  const { t, i18n } = useTranslation('timestamp-converter');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const isTimestampToDate = mode === TimestampConversionMode.TIMESTAMP_TO_DATE;
  const result = isTimestampToDate ? timestampToDateResult : dateToTimestampResult;

  const handleCopy = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      window.setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current));
      }, 2000);
    } catch {
      toast.error(t('output.copyError'), { position: 'bottom-center' });
    }
  };

  const locale = getIntlLocaleTag(i18n.language as Language);
  const localZoneLabel = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const rows = result ? buildRows(isTimestampToDate, result, locale, localZoneLabel, t) : [];

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="space-y-0">
        <CardTitle className="text-sm font-medium">{t('output.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {result && !result.success ? (
          <div
            role="alert"
            className="flex h-64 flex-col items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-center text-sm"
          >
            <CircleX className="h-8 w-8 text-destructive" aria-hidden="true" />
            <p className="font-medium text-destructive">{t('output.invalidTitle')}</p>
            <p className="max-w-sm text-muted-foreground">
              {t(
                result.error.code === ErrorCodes.INVALID_TIMESTAMP
                  ? 'output.invalidTimestampDescription'
                  : 'output.invalidDateDescription',
              )}
            </p>
          </div>
        ) : rows.length > 0 ? (
          <ul className="divide-y rounded-md border">
            {rows.map((row, index) => (
              <li key={row.label} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className="truncate font-mono text-sm">{row.value}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(row.value, index)}
                  aria-label={
                    copiedIndex === index ? t('output.copied') : `${t('output.copy')} ${row.label}`
                  }
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-sm text-muted-foreground">
            <Clock className="h-8 w-8 opacity-50" aria-hidden="true" />
            <p>
              {t(isTimestampToDate ? 'output.emptyTimestampToDate' : 'output.emptyDateToTimestamp')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
