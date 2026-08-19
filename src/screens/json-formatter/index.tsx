import { Braces, CheckCheck, Shrink, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~root/components/ui';
import { useJsonFormatterHooks } from './hooks';
import type { IndentOption } from '~root/utils';
import { InputPanel, OutputPanel } from './components';

export const JsonFormatterPage = () => {
  const { t } = useTranslation('json-formatter');
  const {
    input,
    setInput,
    output,
    indent,
    setIndent,
    error,
    status,
    handleFormat,
    handleMinify,
    handleValidate,
    handleFileLoaded,
    handleClear,
  } = useJsonFormatterHooks();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'color-mix(in oklch, var(--dashboard-accent) 15%, transparent)',
          }}
        >
          <Braces className="h-5 w-5" style={{ color: 'var(--dashboard-accent)' }} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InputPanel
          value={input}
          onChange={setInput}
          onFileLoaded={handleFileLoaded}
          onClear={handleClear}
        />
        <OutputPanel
          value={output}
          hasInput={input.trim().length > 0}
          error={error}
          status={status}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={String(indent)}
          onValueChange={(value) =>
            setIndent((value === 'tab' ? 'tab' : Number(value)) as IndentOption)
          }
        >
          <SelectTrigger size="sm" className="w-36" aria-label={t('actions.indentLabel')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">{t('actions.indent2')}</SelectItem>
            <SelectItem value="4">{t('actions.indent4')}</SelectItem>
            <SelectItem value="tab">{t('actions.indentTab')}</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" onClick={handleFormat} disabled={!input.trim()}>
          <Sparkles className="mr-2 h-4 w-4" />
          {t('actions.format')}
        </Button>
        <Button type="button" variant="outline" onClick={handleMinify} disabled={!input.trim()}>
          <Shrink className="mr-2 h-4 w-4" />
          {t('actions.minify')}
        </Button>
        <Button type="button" variant="outline" onClick={handleValidate} disabled={!input.trim()}>
          <CheckCheck className="mr-2 h-4 w-4" />
          {t('actions.validate')}
        </Button>
      </div>
    </div>
  );
};
