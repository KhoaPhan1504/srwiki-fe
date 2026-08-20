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
  Input,
  Label,
} from '~root/components/ui';
import { ToolPanel } from '~root/components/tools';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
};

export const InputPanel = ({ value, onChange, onClear }: Props) => {
  const { t } = useTranslation('color-converter');

  return (
    <ToolPanel title={t('input.title')}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="color-converter-input">{t('input.label')}</Label>
          <Input
            id="color-converter-input"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={t('input.placeholder')}
            spellCheck={false}
            autoComplete="off"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">{t('input.hint')}</p>
        </div>

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
      </div>
    </ToolPanel>
  );
};
