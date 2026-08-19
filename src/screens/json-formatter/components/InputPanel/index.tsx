import { Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';
import type { ChangeEvent } from 'react';
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
import { UPLOAD_ERROR_KEY } from '~root/constants';
import { validateUploadFile } from '~root/utils';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onFileLoaded: (content: string) => void;
  onClear: () => void;
};

export const InputPanel = ({ value, onChange, onFileLoaded, onClear }: Props) => {
  const { t } = useTranslation('json-formatter');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      toast.error(t(UPLOAD_ERROR_KEY[validation.reason]), { position: 'bottom-center' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onFileLoaded(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => {
      toast.error(t('input.uploadReadError'), { position: 'bottom-center' });
    };
    reader.readAsText(file);
  };

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 space-y-0">
        <CardTitle className="text-sm font-medium">{t('input.title')}</CardTitle>
        <span className="text-xs text-muted-foreground">
          {t('input.charCount', { count: value.length })}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('input.upload')}
          </Button>
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
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t('input.placeholder')}
          spellCheck={false}
          aria-label={t('input.title')}
          className="h-80 resize-none font-mono text-sm"
        />
      </CardContent>
    </Card>
  );
};
