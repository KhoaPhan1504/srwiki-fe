import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyButton } from '~root/components/tools';
import { Input, Label } from '~root/components/ui';
import type { HeaderEntry } from '~root/types';
import { filterHeadersByName } from '~root/utils/headers-inspector';

type Props = {
  // Already sorted by the caller via sortHeaders() — this component does
  // not re-sort, it only filters by the local search query.
  headers: HeaderEntry[];
};

// Stable per-row identity, independent of the search-filtered array's
// position. `headers` is the full, already-sorted list, so a given entry's
// index within it never changes as the user types into the search box —
// unlike its index within the filtered results, which does. Combined with
// name+value this keeps a row's own React state (e.g. CopyButton's
// transient "copied" confirmation) correctly pinned to that row even when
// filtering re-indexes what's visible; name+value alone isn't quite enough
// since headers can legitimately repeat a name with different values (e.g.
// multiple Set-Cookie).
type KeyedHeaderEntry = HeaderEntry & { rowKey: string };

export const HeaderList = ({ headers }: Props) => {
  const { t } = useTranslation('headers-inspector');
  const [query, setQuery] = useState('');
  const keyedHeaders: KeyedHeaderEntry[] = headers.map((header, index) => ({
    ...header,
    rowKey: `${header.name}:${header.value}:${index}`,
  }));
  // filterHeadersByName only filters (never replaces) entries, so the
  // objects it returns are the same KeyedHeaderEntry references passed in —
  // its HeaderEntry[] return type just doesn't say so.
  const filteredHeaders = filterHeadersByName(keyedHeaders, query) as KeyedHeaderEntry[];

  return (
    <div className="space-y-2">
      <Label htmlFor="headers-inspector-search" className="sr-only">
        {t('headers.searchLabel')}
      </Label>
      <Input
        id="headers-inspector-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('headers.searchPlaceholder')}
        spellCheck={false}
        autoComplete="off"
        className="text-sm"
      />

      {headers.length === 0 ? (
        <div className="flex h-80 flex-col items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
          <p>{t('headers.empty')}</p>
        </div>
      ) : filteredHeaders.length === 0 ? (
        <div
          role="status"
          aria-live="polite"
          className="flex h-80 flex-col items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground"
        >
          <p>{t('headers.noResults')}</p>
        </div>
      ) : (
        <dl className="h-80 divide-y overflow-auto rounded-md border text-sm">
          {filteredHeaders.map((header) => (
            <div
              key={header.rowKey}
              className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 py-2"
            >
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-mono font-medium">{header.name}:</dt>
                <dd className="font-mono break-all text-muted-foreground">{header.value}</dd>
              </div>
              <CopyButton
                value={header.value}
                label={t('headers.copy')}
                copiedLabel={t('headers.copied')}
                errorMessage={t('headers.copyError')}
              />
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};
