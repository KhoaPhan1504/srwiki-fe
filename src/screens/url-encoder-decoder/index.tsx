import { Link } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '~root/components/ui';
import { useUrlEncoderDecoderHooks } from './hooks';
import { InputPanel, OutputPanel } from './components';
import type { OperationMode } from '~root/constants';

export const UrlEncoderDecoderScreen = () => {
  const { t } = useTranslation('url-encoder-decoder');
  const { mode, setMode, input, setInput, output, error, handleClear } =
    useUrlEncoderDecoderHooks();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'color-mix(in oklch, var(--dashboard-accent) 15%, transparent)',
          }}
        >
          <Link className="h-5 w-5" style={{ color: 'var(--dashboard-accent)' }} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(value) => setMode(value as OperationMode)}>
        <TabsList>
          <TabsTrigger value="encode">{t('modes.encode')}</TabsTrigger>
          <TabsTrigger value="decode">{t('modes.decode')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InputPanel value={input} mode={mode} onChange={setInput} onClear={handleClear} />
        <OutputPanel value={output} mode={mode} error={error} />
      </div>
    </div>
  );
};
