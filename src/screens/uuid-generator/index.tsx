import { Fingerprint } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUuidGeneratorHooks } from './hooks';
import { ConfigPanel, ResultsPanel, ValidatePanel } from './components';

export const UuidGeneratorPage = () => {
  const { t } = useTranslation('uuid-generator');
  const {
    version,
    setVersion,
    quantity,
    setQuantity,
    quantityValidation,
    caseOption,
    setCaseOption,
    removeHyphens,
    setRemoveHyphens,
    results,
    resultsVersion,
    handleGenerate,
    handleClear,
  } = useUuidGeneratorHooks();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'color-mix(in oklch, var(--dashboard-accent) 15%, transparent)',
          }}
        >
          <Fingerprint className="h-5 w-5" style={{ color: 'var(--dashboard-accent)' }} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      <ConfigPanel
        version={version}
        onVersionChange={setVersion}
        quantity={quantity}
        onQuantityChange={setQuantity}
        quantityValidation={quantityValidation}
        caseOption={caseOption}
        onCaseChange={setCaseOption}
        removeHyphens={removeHyphens}
        onRemoveHyphensChange={setRemoveHyphens}
        onGenerate={handleGenerate}
      />

      <ResultsPanel results={results} version={resultsVersion} onClear={handleClear} />

      <ValidatePanel />
    </div>
  );
};
