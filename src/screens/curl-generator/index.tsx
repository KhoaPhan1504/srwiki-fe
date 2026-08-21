import { TerminalSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToolHeader } from '~root/components/tools';
import { MethodUrlBar, OutputPanel, RequestPanel } from './components';
import { useCurlGeneratorHooks } from './hooks';

export const CurlGeneratorScreen = () => {
  const { t } = useTranslation('curl-generator');
  const {
    method,
    setMethod,
    url,
    setUrl,
    queryParams,
    addQueryParam,
    updateQueryParam,
    removeQueryParam,
    headers,
    addHeader,
    updateHeader,
    removeHeader,
    body,
    setBody,
    format,
    setFormat,
    result,
    handleClear,
  } = useCurlGeneratorHooks();

  return (
    <div className="space-y-6">
      <ToolHeader title={t('title')} description={t('description')} icon={TerminalSquare} />

      <MethodUrlBar
        method={method}
        onMethodChange={setMethod}
        url={url}
        onUrlChange={setUrl}
        onClear={handleClear}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RequestPanel
          method={method}
          queryParams={queryParams}
          onAddQueryParam={addQueryParam}
          onUpdateQueryParam={updateQueryParam}
          onRemoveQueryParam={removeQueryParam}
          headers={headers}
          onAddHeader={addHeader}
          onUpdateHeader={updateHeader}
          onRemoveHeader={removeHeader}
          body={body}
          onBodyChange={setBody}
        />
        <OutputPanel result={result} format={format} onFormatChange={setFormat} />
      </div>
    </div>
  );
};
