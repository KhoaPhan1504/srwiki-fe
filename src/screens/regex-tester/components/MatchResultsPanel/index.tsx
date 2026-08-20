import { useTranslation } from 'react-i18next';
import { ToolPanel } from '~root/components/tools';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~root/components/ui';
import type { RegexMatch } from '~root/types';

type Props = {
  matches: RegexMatch[];
  truncated: boolean;
};

export const MatchResultsPanel = ({ matches, truncated }: Props) => {
  const { t } = useTranslation('regex-tester');

  return (
    <ToolPanel title={t('results.title')}>
      <p role="status" className="mb-3 text-sm font-medium">
        {matches.length > 0
          ? t('results.matchCount', { count: matches.length })
          : t('results.noMatches')}
      </p>
      {truncated && <p className="mb-3 text-xs text-muted-foreground">{t('results.truncated')}</p>}
      {matches.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('results.columnMatch')}</TableHead>
                <TableHead>{t('results.columnValue')}</TableHead>
                <TableHead>{t('results.columnIndex')}</TableHead>
                <TableHead>{t('results.columnLength')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match, index) => (
                <TableRow key={`${match.index}-${index}`}>
                  <TableCell colSpan={4} className="p-0">
                    <details className="px-4 py-2">
                      <summary className="grid cursor-pointer grid-cols-4 gap-2 text-sm">
                        <span>#{index + 1}</span>
                        <span className="truncate font-mono">
                          {match.value || t('results.emptyMatch')}
                        </span>
                        <span>{match.index}</span>
                        <span>{match.length}</span>
                      </summary>
                      <div className="mt-2 space-y-1 pl-4 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">
                            {t('results.fullMatch')}:{' '}
                          </span>
                          <span className="font-mono">
                            {match.value || t('results.emptyMatch')}
                          </span>
                        </p>
                        {match.groups.length > 0 && (
                          <div>
                            <p className="font-medium text-foreground">{t('results.groups')}</p>
                            {match.groups.map((group, groupIndex) => (
                              <p key={groupIndex} className="pl-2 font-mono">
                                {groupIndex + 1}: {group ?? t('results.noMatchGroup')}
                              </p>
                            ))}
                          </div>
                        )}
                        {match.namedGroups && Object.keys(match.namedGroups).length > 0 && (
                          <div>
                            <p className="font-medium text-foreground">
                              {t('results.namedGroups')}
                            </p>
                            {Object.entries(match.namedGroups).map(([name, value]) => (
                              <p key={name} className="pl-2 font-mono">
                                {name}: {value ?? t('results.noMatchGroup')}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </details>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </ToolPanel>
  );
};
