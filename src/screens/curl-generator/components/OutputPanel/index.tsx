import { CircleX, TerminalSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CopyButton, ToolPanel } from '~root/components/tools';
import { Tabs, TabsList, TabsTrigger } from '~root/components/ui';
import { ErrorCodes } from '~root/constants';
import type { CurlCommandFormat, CurlGenerationResult } from '~root/types';

type Props = {
  result: CurlGenerationResult | null;
  format: CurlCommandFormat;
  onFormatChange: (format: CurlCommandFormat) => void;
};

const ERROR_DESCRIPTION_KEY: Partial<Record<ErrorCodes, string>> = {
  [ErrorCodes.INVALID_URL]: 'errors.invalidUrl',
  [ErrorCodes.INVALID_HEADER_KEY]: 'errors.invalidHeaderKey',
};

export const OutputPanel = ({ result, format, onFormatChange }: Props) => {
  const { t } = useTranslation('curl-generator');
  const command = result?.success ? result.command : '';

  return (
    <ToolPanel
      title={t('output.title')}
      headerActions={
        <div className="flex items-center gap-2">
          <Tabs
            value={format}
            onValueChange={(value) => onFormatChange(value as CurlCommandFormat)}
          >
            <TabsList>
              <TabsTrigger value="singleLine">{t('output.formatTabs.singleLine')}</TabsTrigger>
              <TabsTrigger value="multiLine">{t('output.formatTabs.multiLine')}</TabsTrigger>
            </TabsList>
          </Tabs>
          <CopyButton
            value={command}
            label={t('output.copy')}
            copiedLabel={t('output.copied')}
            errorMessage={t('output.copyError')}
            disabled={!command}
          />
        </div>
      }
    >
      {result && !result.success ? (
        <div
          role="alert"
          className="flex h-64 flex-col items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-center text-sm"
        >
          <CircleX className="h-8 w-8 text-destructive" aria-hidden="true" />
          <p className="font-medium text-destructive">{t('output.invalidTitle')}</p>
          <p className="max-w-sm text-muted-foreground">
            {t(ERROR_DESCRIPTION_KEY[result.error.code] ?? 'errors.invalidUrl')}
          </p>
        </div>
      ) : result?.success ? (
        <pre className="h-64 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm break-all whitespace-pre-wrap">
          {result.command}
        </pre>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-sm text-muted-foreground">
          <TerminalSquare className="h-8 w-8 opacity-50" aria-hidden="true" />
          <p>{t('output.empty')}</p>
        </div>
      )}
    </ToolPanel>
  );
};
