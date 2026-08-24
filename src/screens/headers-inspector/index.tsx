import { CircleX, Loader2, ScrollText, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CopyButton, ToolHeader, ToolPanel } from '~root/components/tools';
import { ErrorCodes } from '~root/constants';
import type { HeaderInspectionError } from '~root/types';
import { formatHeadersRaw, sortHeaders } from '~root/utils';
import { HeaderList, RequestBar, ResponseSummary } from './components';
import { useHeadersInspectorHooks } from './hooks';

// Fixed, code-driven messages only — never render the raw backend `message`.
// blockedUrl in particular is intentionally vague (see i18n vi copy) so we
// never reveal *why* a URL was blocked to someone probing the SSRF filter.
const ERROR_MESSAGE_KEYS: Partial<Record<ErrorCodes, string>> = {
  [ErrorCodes.INVALID_URL]: 'errors.invalidUrl',
  [ErrorCodes.BLOCKED_URL]: 'errors.blockedUrl',
  [ErrorCodes.NETWORK_ERROR]: 'errors.networkError',
  [ErrorCodes.REQUEST_TIMEOUT]: 'errors.requestTimeout',
  [ErrorCodes.TOO_MANY_REDIRECTS]: 'errors.tooManyRedirects',
};

const InspectionErrorBanner = ({ error }: { error: HeaderInspectionError }) => {
  const { t } = useTranslation('headers-inspector');
  const messageKey = ERROR_MESSAGE_KEYS[error.code] ?? 'errors.networkError';

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm"
    >
      <CircleX className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      <p className="text-destructive">{t(messageKey)}</p>
    </div>
  );
};

export const HeadersInspectorScreen = () => {
  const { t } = useTranslation('headers-inspector');
  const { url, setUrl, submittedUrl, status, response, error, handleSend, handleClear } =
    useHeadersInspectorHooks();

  // Sorted once here and reused both for on-screen display and the copy-all
  // output, so the two always match order.
  const sortedHeaders = response ? sortHeaders(response.headers) : [];
  const hasResult = status === 'success' || status === 'error';

  return (
    <div className="space-y-6">
      <ToolHeader title={t('title')} description={t('description')} icon={ScrollText} />

      <RequestBar
        url={url}
        onUrlChange={setUrl}
        status={status}
        hasResult={hasResult}
        onSend={handleSend}
        onClear={handleClear}
      />

      <ToolPanel
        title={t('response.title')}
        headerActions={
          status === 'success' && response ? (
            <CopyButton
              value={formatHeadersRaw(sortedHeaders)}
              label={t('response.copyAll')}
              copiedLabel={t('response.copyAllCopied')}
              errorMessage={t('response.copyAllError')}
            />
          ) : undefined
        }
      >
        {/* role="status"/aria-live="polite" so screen readers announce the
            idle -> sending -> success/error transition. The error banner
            keeps its own role="alert" (a stronger, correctly-used live
            region for errors) — this wrapper doesn't replace it, it just
            makes the non-error transitions (sending, success) audible too. */}
        <div role="status" aria-live="polite">
          {status === 'idle' && (
            <div className="flex h-80 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-sm text-muted-foreground">
              <Send className="h-8 w-8 opacity-50" aria-hidden="true" />
              <p>{t('response.idle')}</p>
            </div>
          )}

          {status === 'sending' && (
            <div className="flex h-80 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin opacity-50" aria-hidden="true" />
              <p>{t('response.sending')}</p>
            </div>
          )}

          {status === 'error' && error && <InspectionErrorBanner error={error} />}

          {status === 'success' && response && (
            <div className="space-y-4">
              <ResponseSummary response={response} requestUrl={submittedUrl} />
              <HeaderList headers={sortedHeaders} />
            </div>
          )}
        </div>
      </ToolPanel>
    </div>
  );
};
