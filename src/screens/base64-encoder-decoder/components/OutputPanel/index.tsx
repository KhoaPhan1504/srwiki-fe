import { Binary, Check, CircleX, Copy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Button, Card, CardContent, CardHeader, CardTitle } from '~root/components/ui';
import type { Base64Error, Base64Mode } from '~root/utils';

type Props = {
  value: string;
  mode: Base64Mode;
  error: Base64Error | null;
};

export const OutputPanel = ({ value, mode, error }: Props) => {
  const { t } = useTranslation('base64-encoder-decoder');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('output.copyError'), { position: 'bottom-center' });
    }
  };

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 space-y-0">
        <CardTitle className="text-sm font-medium">{t('output.title')}</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!value}
          aria-label={copied ? t('output.copied') : t('output.copy')}
        >
          {copied ? (
            <Check className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          )}
          <span className="hidden sm:inline" aria-hidden="true">
            {copied ? t('output.copied') : t('output.copy')}
          </span>
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div
            role="alert"
            className="flex h-80 flex-col items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-center text-sm"
          >
            <CircleX className="h-8 w-8 text-destructive" aria-hidden="true" />
            <p className="font-medium text-destructive">{t('output.invalidTitle')}</p>
            <p className="max-w-sm text-muted-foreground">{t('output.invalidBase64')}</p>
          </div>
        ) : value ? (
          <pre className="h-80 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm break-all whitespace-pre-wrap">
            {value}
          </pre>
        ) : (
          <div className="flex h-80 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-sm text-muted-foreground">
            <Binary className="h-8 w-8 opacity-50" aria-hidden="true" />
            <p>
              {t(mode === 'encode' ? 'output.emptyNoInputEncode' : 'output.emptyNoInputDecode')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
