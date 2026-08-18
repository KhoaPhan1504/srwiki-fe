import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea } from '~root/components/ui';

type Props = {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
};

export const HeaderPanel = ({ value, onChange, error }: Props) => {
  const { t } = useTranslation('jwt-web-token');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('header.copyError'), { position: 'bottom-center' });
    }
  };

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 space-y-0">
        <CardTitle className="text-sm font-medium">{t('header.title')}</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!value}
          aria-label={copied ? t('header.copyCopied') : t('header.copy')}
        >
          {copied ? (
            <Check className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          )}
          <span className="hidden sm:inline" aria-hidden="true">
            {copied ? t('header.copyCopied') : t('header.copy')}
          </span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          aria-label={t('header.title')}
          aria-invalid={error !== null}
          className="h-48 resize-none font-mono text-sm"
        />
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {t('header.invalidJson', { message: error })}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
