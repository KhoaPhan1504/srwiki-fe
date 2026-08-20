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
  Textarea,
} from '~root/components/ui';
import type { OperationMode } from '~root/constants';

type Props = {
  value: string;
  mode: OperationMode;
  onChange: (value: string) => void;
  onClear: () => void;
};

export const InputPanel = ({ value, mode, onChange, onClear }: Props) => {
  const { t } = useTranslation('url-encoder-decoder');

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 space-y-0">
        <CardTitle className="text-sm font-medium">{t('input.title')}</CardTitle>
        <span className="text-xs text-muted-foreground">
          {t('input.charCount', { count: value.length })}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t(mode === 'encode' ? 'input.placeholderEncode' : 'input.placeholderDecode')}
          spellCheck={false}
          aria-label={t('input.title')}
          className="h-80 resize-none font-mono text-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" disabled={!value}>
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
