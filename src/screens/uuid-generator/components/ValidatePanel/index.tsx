import { CircleCheck, CircleX } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from '~root/components/ui';
import { parseUuidInfo } from '~root/utils';

export const ValidatePanel = () => {
  const { t } = useTranslation('uuid-generator');
  const [input, setInput] = useState('');

  const info = input.trim() ? parseUuidInfo(input) : null;

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t('validate.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="uuid-validate-input">{t('validate.inputLabel')}</Label>
          <Input
            id="uuid-validate-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('validate.placeholder')}
            spellCheck={false}
            autoComplete="off"
            className="font-mono text-sm"
          />
        </div>

        {info &&
          (info.valid ? (
            <div
              role="status"
              className="flex flex-col gap-1 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm"
            >
              <span className="flex items-center gap-2 font-medium text-primary">
                <CircleCheck className="h-4 w-4" aria-hidden="true" />
                {t('validate.valid')}
              </span>
              <span>{t('validate.versionLine', { version: info.version })}</span>
              <span>
                {t('validate.variantLine', { variant: t(`validate.variant.${info.variant}`) })}
              </span>
              {info.timestampMs !== null && (
                <span>
                  {t('validate.timestampLine', {
                    timestamp: new Date(info.timestampMs).toISOString(),
                  })}
                </span>
              )}
            </div>
          ) : (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <CircleX className="h-4 w-4" aria-hidden="true" />
              {t('validate.invalid')}
            </div>
          ))}
      </CardContent>
    </Card>
  );
};
