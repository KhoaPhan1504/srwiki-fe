import { Loader2, Send } from 'lucide-react';
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
import type { HeaderInspectionStatus } from '~root/types';

type Props = {
  url: string;
  onUrlChange: (url: string) => void;
  status: HeaderInspectionStatus;
  // Whether a response/error currently exists (i.e. there's something for
  // Clear to actually dismiss). Needed separately from `url` because the
  // user can select-all + delete the URL input after a result has already
  // rendered — the result panel is still showing, but `url` is empty.
  hasResult: boolean;
  onSend: () => void;
  onClear: () => void;
};

export const RequestBar = ({ url, onUrlChange, status, hasResult, onSend, onClear }: Props) => {
  const { t } = useTranslation('headers-inspector');
  const isSending = status === 'sending';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Label htmlFor="headers-inspector-url" className="sr-only">
        {t('request.urlLabel')}
      </Label>
      <Input
        id="headers-inspector-url"
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder={t('request.urlPlaceholder')}
        spellCheck={false}
        autoComplete="off"
        className="min-w-[200px] flex-1 font-mono text-sm"
      />

      <Button
        type="button"
        onClick={onSend}
        disabled={isSending || !url}
        aria-label={isSending ? t('actions.inspecting') : t('actions.inspect')}
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin sm:mr-2" aria-hidden="true" />
        ) : (
          <Send className="h-4 w-4 sm:mr-2" aria-hidden="true" />
        )}
        <span className="hidden sm:inline" aria-hidden="true">
          {isSending ? t('actions.inspecting') : t('actions.inspect')}
        </span>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="outline" disabled={!url && !hasResult}>
            {t('actions.clear')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.clearConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('actions.clearConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onClear}>
              {t('actions.clear')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
