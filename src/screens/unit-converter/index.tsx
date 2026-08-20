import { Ruler } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToolHeader } from '~root/components/tools';
import { Tabs, TabsList, TabsTrigger } from '~root/components/ui';
import { UnitCategory } from '~root/constants';
import { InputPanel, OutputPanel } from './components';
import { useUnitConverterHooks } from './hooks';

export const UnitConverterScreen = () => {
  const { t } = useTranslation('unit-converter');
  const {
    category,
    setCategory,
    unit,
    setUnit,
    input,
    setInput,
    baseFontSizePx,
    setBaseFontSizePx,
    result,
    handleClear,
  } = useUnitConverterHooks();

  return (
    <div className="space-y-6">
      <ToolHeader title={t('title')} description={t('description')} icon={Ruler} />

      <Tabs value={category} onValueChange={(value) => setCategory(value as UnitCategory)}>
        <TabsList>
          <TabsTrigger value={UnitCategory.LENGTH}>{t('categories.length')}</TabsTrigger>
          <TabsTrigger value={UnitCategory.DATA}>{t('categories.data')}</TabsTrigger>
          <TabsTrigger value={UnitCategory.TIME}>{t('categories.time')}</TabsTrigger>
          <TabsTrigger value={UnitCategory.TEMPERATURE}>{t('categories.temperature')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InputPanel
          category={category}
          unit={unit}
          input={input}
          baseFontSizePx={baseFontSizePx}
          onUnitChange={setUnit}
          onInputChange={setInput}
          onBaseFontSizePxChange={setBaseFontSizePx}
          onClear={handleClear}
        />
        <OutputPanel result={result} />
      </div>
    </div>
  );
};
