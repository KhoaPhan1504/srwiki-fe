import { Regex, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '~root/components/ui';
import { ToolHeader } from '~root/components/tools';
import {
  CheatsheetPanel,
  ExamplesPanel,
  MatchHighlight,
  MatchResultsPanel,
  PatternPanel,
  ReplacePanel,
  TestStringPanel,
} from './components';
import { useRegexTester } from './hooks';

export const RegexTesterScreen = () => {
  const { t } = useTranslation('regex-tester');
  const {
    pattern,
    setPattern,
    flags,
    toggleFlag,
    testString,
    setTestString,
    replacement,
    setReplacement,
    syntaxError,
    matches,
    truncated,
    replacePreview,
    execStatus,
    execErrorMessage,
    loadExample,
    handleReplaceAll,
    handleClear,
  } = useRegexTester();

  const hasContent = Boolean(pattern || testString || replacement);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToolHeader title={t('title')} description={t('description')} icon={Regex} />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={!hasContent}>
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('clear.button')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('clear.confirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>{t('clear.confirmDescription')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleClear}>
                {t('clear.button')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <ExamplesPanel onSelectExample={loadExample} />

      <PatternPanel
        pattern={pattern}
        onPatternChange={setPattern}
        flags={flags}
        onToggleFlag={toggleFlag}
        syntaxError={syntaxError}
      />

      <TestStringPanel value={testString} onChange={setTestString} />

      {execStatus === 'timeout' && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {t('pattern.invalidTitle')} — {t('results.noMatches')}
        </div>
      )}
      {execStatus === 'error' && execErrorMessage && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {execErrorMessage}
        </div>
      )}

      <MatchHighlight testString={testString} matches={matches} />

      <MatchResultsPanel matches={matches} truncated={truncated} />

      <ReplacePanel
        replacement={replacement}
        onReplacementChange={setReplacement}
        replacePreview={replacePreview}
        hasSyntaxError={Boolean(syntaxError)}
        testStringEmpty={!testString}
        onReplaceAll={handleReplaceAll}
      />

      <CheatsheetPanel />
    </div>
  );
};
