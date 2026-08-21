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
import type { HttpMethod } from '~root/types';

type Props = {
  method: HttpMethod;
  onMethodChange: (method: HttpMethod) => void;
  url: string;
  onUrlChange: (url: string) => void;
  onClear: () => void;
};

export const MethodUrlBar = ({ method, onMethodChange, url, onUrlChange, onClear }: Props) => {
  const { t } = useTranslation('curl-generator');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Label htmlFor="curl-generator-method" className="sr-only">
        {t('request.methodLabel')}
      </Label>
      <Select value={method} onValueChange={(value) => onMethodChange(value as HttpMethod)}>
        <SelectTrigger id="curl-generator-method" className="w-28 font-mono">
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

      <Label htmlFor="curl-generator-url" className="sr-only">
        {t('request.urlLabel')}
      </Label>
      <Input
        id="curl-generator-url"
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder={t('request.urlPlaceholder')}
        spellCheck={false}
        autoComplete="off"
        className="min-w-[200px] flex-1 font-mono text-sm"
      />

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
