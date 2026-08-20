import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '~root/components/ui';
import { TimestampConversionMode } from '~root/constants';
import { InputPanel, OutputPanel } from './components';
import { useTimestampConverterHooks } from './hooks';

export const TimestampConverterScreen = () => {
  const { t } = useTranslation('timestamp-converter');
  const {
    mode,
    setMode,
    unit,
    setUnit,
    timezoneMode,
    setTimezoneMode,
    input,
    setInput,
    timestampToDateResult,
    dateToTimestampResult,
    handleClear,
  } = useTimestampConverterHooks();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'color-mix(in oklch, var(--dashboard-accent) 15%, transparent)',
          }}
        >
          <Clock className="h-5 w-5" style={{ color: 'var(--dashboard-accent)' }} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(value) => setMode(value as TimestampConversionMode)}>
        <TabsList>
          <TabsTrigger value={TimestampConversionMode.TIMESTAMP_TO_DATE}>
            {t('modes.timestampToDate')}
          </TabsTrigger>
          <TabsTrigger value={TimestampConversionMode.DATE_TO_TIMESTAMP}>
            {t('modes.dateToTimestamp')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InputPanel
          mode={mode}
          input={input}
          unit={unit}
          timezoneMode={timezoneMode}
          onInputChange={setInput}
          onUnitChange={setUnit}
          onTimezoneModeChange={setTimezoneMode}
          onClear={handleClear}
        />
        <OutputPanel
          mode={mode}
          timestampToDateResult={timestampToDateResult}
          dateToTimestampResult={dateToTimestampResult}
        />
      </div>
    </div>
  );
};
