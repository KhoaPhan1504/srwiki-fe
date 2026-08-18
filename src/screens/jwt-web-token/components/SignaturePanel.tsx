import { Check, CircleCheck, CircleX, Copy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '~root/components/ui';
import { splitSegments } from '../utils';
import type { SignatureStatus } from '../hooks';

type Props = {
  token: string;
  signatureStatus: SignatureStatus;
};

export const SignaturePanel = ({ token, signatureStatus }: Props) => {
  const { t } = useTranslation('jwt-web-token');
  const [copied, setCopied] = useState(false);

  const segments = splitSegments(token);
  const signature = segments.length === 3 ? segments[2] : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(signature);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('signature.copyError'), { position: 'bottom-center' });
    }
  };

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 space-y-0">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-sm font-medium">{t('signature.title')}</CardTitle>
          {signature && signatureStatus === 'valid' && (
            <Badge variant="verify-primary" role="status">
              <CircleCheck className="h-3 w-3" aria-hidden="true" />
              {t('signature.verified')}
            </Badge>
          )}
          {signature && signatureStatus === 'invalid' && (
            <Badge variant="destructive" role="status">
              <CircleX className="h-3 w-3" aria-hidden="true" />
              {t('signature.invalid')}
            </Badge>
          )}
          {signature && signatureStatus === 'unknown' && (
            <Badge variant="outline" role="status">
              {t('signature.notVerified')}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!signature}
          aria-label={copied ? t('signature.copyCopied') : t('signature.copy')}
        >
          {copied ? (
            <Check className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          )}
          <span className="hidden sm:inline" aria-hidden="true">
            {copied ? t('signature.copyCopied') : t('signature.copy')}
          </span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {signature ? (
          <pre className="overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm break-all whitespace-pre-wrap">
            {signature}
          </pre>
        ) : (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            {t('signature.empty')}
          </p>
        )}
        {signature && signatureStatus === 'unknown' && (
          <p className="text-xs text-muted-foreground">{t('signature.provideKeyHint')}</p>
        )}
      </CardContent>
    </Card>
  );
};
