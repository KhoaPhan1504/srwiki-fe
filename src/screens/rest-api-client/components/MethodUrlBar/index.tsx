import { Loader2, Send, X } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~root/components/ui';
import { HTTP_METHODS } from '~root/constants';
import type { Environment, HttpMethod, RestClientStatus } from '~root/types';
import { EnvironmentSelector } from '../EnvironmentSelector';

type Props = {
  method: HttpMethod;
  onMethodChange: (method: HttpMethod) => void;
  url: string;
  onUrlChange: (url: string) => void;
  status: RestClientStatus;
  onSend: () => void;
  onCancel: () => void;
  onClear: () => void;
  onSave: () => void;
  environments: Environment[];
  environmentId: string | null;
  onEnvironmentIdChange: (id: string | null) => void;
  onManageEnvironments: () => void;
};

export const MethodUrlBar = ({
  method,
  onMethodChange,
  url,
  onUrlChange,
  status,
  onSend,
  onCancel,
  onClear,
  onSave,
  environments,
  environmentId,
  onEnvironmentIdChange,
  onManageEnvironments,
}: Props) => {
  const { t } = useTranslation('rest-api-client');
  const isSending = status === 'sending';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Label htmlFor="rest-api-client-method" className="sr-only">
        {t('request.methodLabel')}
      </Label>
      <Select value={method} onValueChange={(value) => onMethodChange(value as HttpMethod)}>
        <SelectTrigger id="rest-api-client-method" className="w-28 font-mono">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HTTP_METHODS.map((httpMethod) => (
            <SelectItem key={httpMethod} value={httpMethod} className="font-mono">
              {httpMethod}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label htmlFor="rest-api-client-url" className="sr-only">
        {t('request.urlLabel')}
      </Label>
      <Input
        id="rest-api-client-url"
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder={t('request.urlPlaceholder')}
        spellCheck={false}
        autoComplete="off"
        className="min-w-[200px] flex-1 font-mono text-sm"
      />

      <EnvironmentSelector
        environments={environments}
        environmentId={environmentId}
        onEnvironmentIdChange={onEnvironmentIdChange}
        onManage={onManageEnvironments}
      />

      <Button
        type="button"
        onClick={onSend}
        disabled={isSending || !url}
        aria-label={isSending ? t('actions.sending') : t('actions.send')}
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin sm:mr-2" aria-hidden="true" />
        ) : (
          <Send className="h-4 w-4 sm:mr-2" aria-hidden="true" />
        )}
        <span className="hidden sm:inline" aria-hidden="true">
          {isSending ? t('actions.sending') : t('actions.send')}
        </span>
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onSave}
        disabled={!url}
        aria-label={t('actions.save')}
      >
        {t('actions.save')}
      </Button>

      {isSending && (
        <Button type="button" variant="outline" onClick={onCancel} aria-label={t('actions.cancel')}>
          <X className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          <span className="hidden sm:inline" aria-hidden="true">
            {t('actions.cancel')}
          </span>
        </Button>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="outline" disabled={!url}>
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
