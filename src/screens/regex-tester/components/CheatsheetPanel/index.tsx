import { useTranslation } from 'react-i18next';
import { ToolPanel } from '~root/components/tools';
import { FLAG_DEFINITIONS, SYNTAX_CHEATSHEET } from '~root/constants';

export const CheatsheetPanel = () => {
  const { t } = useTranslation('regex-tester');

  return (
    <ToolPanel title={t('cheatsheet.title')}>
      <details>
        <summary className="cursor-pointer text-sm font-medium">{t('cheatsheet.toggle')}</summary>
        <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {SYNTAX_CHEATSHEET.map(({ token, descriptionKey }) => (
            <div key={token} className="flex items-center gap-2">
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{token}</code>
              <span className="text-muted-foreground">{t(descriptionKey)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {FLAG_DEFINITIONS.map(({ flag, descriptionKey }) => (
            <div key={flag} className="flex items-center gap-2">
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{flag}</code>
              <span className="text-muted-foreground">{t(descriptionKey)}</span>
            </div>
          ))}
        </div>
      </details>
    </ToolPanel>
  );
};
