import { Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyButton, ToolPanel } from '~root/components/tools';
import { Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '~root/components/ui';
import type { RestClientError, RestClientStatus, RestResponse } from '~root/types';
import { formatResponseDuration, formatResponseSize } from '~root/utils';
import { RequestErrorBanner } from '../RequestErrorBanner';

type Tab = 'body' | 'headers';

type StatusBadgeVariant = 'success' | 'info' | 'warning' | 'destructive';

const statusBadgeVariant = (status: number): StatusBadgeVariant => {
  if (status < 300) return 'success';
  if (status < 400) return 'info';
  if (status < 500) return 'warning';
  return 'destructive';
};

type Props = {
  status: RestClientStatus;
  response: RestResponse | null;
  error: RestClientError | null;
};

export const ResponsePanel = ({ status, response, error }: Props) => {
  const { t } = useTranslation('rest-api-client');
  const [activeTab, setActiveTab] = useState<Tab>('body');

  return (
    <ToolPanel title={t('response.title')}>
      {status === 'idle' && (
        <div className="flex h-80 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-sm text-muted-foreground">
          <Send className="h-8 w-8 opacity-50" aria-hidden="true" />
          <p>{t('response.emptyIdle')}</p>
        </div>
      )}

      {status === 'sending' && (
        <div className="flex h-80 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin opacity-50" aria-hidden="true" />
          <p>{t('response.sending')}</p>
        </div>
      )}

      {status === 'error' && error && <RequestErrorBanner error={error} />}

      {status === 'success' && response && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant={statusBadgeVariant(response.status)}>
              {response.status} {response.statusText}
            </Badge>
            <span className="text-muted-foreground">
              {t('response.duration', { value: formatResponseDuration(response.durationMs) })}
            </span>
            <span className="text-muted-foreground">
              {t('response.size', { value: formatResponseSize(response.sizeBytes) })}
            </span>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)}>
            <TabsList>
              <TabsTrigger value="body">{t('response.tabs.body')}</TabsTrigger>
              <TabsTrigger value="headers">{t('response.tabs.headers')}</TabsTrigger>
            </TabsList>

            <TabsContent value="body">
              <ResponseBody body={response.body} />
            </TabsContent>

            <TabsContent value="headers">
              <ResponseHeaders headers={response.headers} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </ToolPanel>
  );
};

const ResponseBody = ({ body }: { body: RestResponse['body'] }) => {
  const { t } = useTranslation('rest-api-client');
  const displayText = body.isJson ? JSON.stringify(body.json, null, 2) : body.text;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <CopyButton
          value={displayText}
          label={t('response.copy')}
          copiedLabel={t('response.copied')}
          errorMessage={t('response.copyError')}
          disabled={!displayText}
        />
      </div>
      {displayText ? (
        <pre className="h-80 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm break-all whitespace-pre-wrap">
          {displayText}
        </pre>
      ) : (
        <div className="flex h-80 flex-col items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
          <p>{t('response.emptyBody')}</p>
        </div>
      )}
    </div>
  );
};

const ResponseHeaders = ({ headers }: { headers: Record<string, string> }) => {
  const { t } = useTranslation('rest-api-client');
  const entries = Object.entries(headers);

  if (entries.length === 0) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
        <p>{t('response.noHeaders')}</p>
      </div>
    );
  }

  return (
    <dl className="h-80 divide-y overflow-auto rounded-md border text-sm">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-wrap gap-x-2 px-3 py-2">
          <dt className="font-mono font-medium">{key}:</dt>
          <dd className="font-mono break-all text-muted-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
};
