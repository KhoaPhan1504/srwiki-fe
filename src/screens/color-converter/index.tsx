import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToolHeader } from '~root/components/tools';
import { InputPanel, OutputPanel } from './components';
import { useColorConverterHooks } from './hooks';

export const ColorConverterScreen = () => {
  const { t } = useTranslation('color-converter');
  const { input, setInput, result, handleClear } = useColorConverterHooks();

  return (
    <div className="space-y-6">
      <ToolHeader title={t('title')} description={t('description')} icon={Palette} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InputPanel value={input} onChange={setInput} onClear={handleClear} />
        <OutputPanel result={result} />
      </div>
    </div>
  );
};
