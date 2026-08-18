import { Check, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
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
  Textarea,
} from '~root/components/ui';
import type { DecodeError } from '../utils';

const DECODE_ERROR_KEY: Partial<Record<DecodeError['code'], string>> = {
  INVALID_SEGMENT_COUNT: 'input.errors.invalidSegmentCount',
  INVALID_BASE64: 'input.errors.invalidBase64',
  INVALID_JSON_HEADER: 'input.errors.invalidJsonHeader',
  INVALID_JSON_PAYLOAD: 'input.errors.invalidJsonPayload',
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  error: DecodeError | null;
};

export const TokenInputPanel = ({ value, onChange, onClear, error }: Props) => {
  const { t } = useTranslation('jwt-web-token');
  const [copied, setCopied] = useState(false);

  const errorKey = error ? DECODE_ERROR_KEY[error.code] : undefined;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('input.copyError'), { position: 'bottom-center' });
    }
  };

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 space-y-0">
        <CardTitle className="text-sm font-medium">{t('input.title')}</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {t('input.charCount', { count: value.length })}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!value}
            aria-label={copied ? t('input.copyTokenCopied') : t('input.copyToken')}
          >
            {copied ? (
              <Check className="h-4 w-4 sm:mr-2" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4 sm:mr-2" aria-hidden="true" />
            )}
            <span className="hidden sm:inline" aria-hidden="true">
              {copied ? t('input.copyTokenCopied') : t('input.copyToken')}
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t('input.placeholder')}
          spellCheck={false}
          aria-label={t('input.title')}
          aria-invalid={errorKey !== undefined}
          className="h-40 resize-none font-mono text-sm break-all"
        />
        {errorKey && (
          <p role="alert" className="text-xs text-destructive">
            {t(errorKey)}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" disabled={!value}>
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
