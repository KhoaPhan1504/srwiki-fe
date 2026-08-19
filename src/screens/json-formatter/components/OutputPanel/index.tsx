import { Check, CircleCheck, CircleX, Copy, Download, FileJson } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '~root/components/ui';
import type { ProcessingStatus } from '~root/constants';
import type { JsonParseError } from '~root/utils';

type Props = {
  value: string;
  hasInput: boolean;
  error: JsonParseError | null;
  status: ProcessingStatus;
};

export const OutputPanel = ({ value, hasInput, error, status }: Props) => {
  const { t } = useTranslation('json-formatter');
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

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'formatted.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 space-y-0">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-sm font-medium">{t('output.title')}</CardTitle>
          {status === 'valid' && (
            <Badge variant="verify-primary" role="status">
              <CircleCheck className="h-3 w-3" aria-hidden="true" />
              {t('output.validBadge')}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!value}
            aria-label={t('output.download')}
          >
            <Download className="h-4 w-4 sm:mr-2" aria-hidden="true" />
            <span className="hidden sm:inline" aria-hidden="true">
              {t('output.download')}
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div
            role="alert"
            className="flex h-80 flex-col items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-center text-sm"
          >
            <CircleX className="h-8 w-8 text-destructive" aria-hidden="true" />
            <p className="font-medium text-destructive">{t('output.invalidTitle')}</p>
            <p className="max-w-sm text-muted-foreground">
              {error.line && error.column
                ? t('output.errorDetail', {
                    line: error.line,
                    column: error.column,
                    message: error.message,
                  })
                : error.message}
            </p>
          </div>
        ) : value ? (
          <pre className="h-80 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm whitespace-pre-wrap">
            {value}
          </pre>
        ) : (
          <div className="flex h-80 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-sm text-muted-foreground">
            <FileJson className="h-8 w-8 opacity-50" aria-hidden="true" />
            <p>
              {!hasInput
                ? t('output.emptyNoInput')
                : status === 'valid'
                  ? t('output.emptyValidNoOutput')
                  : t('output.emptyWithInput')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
