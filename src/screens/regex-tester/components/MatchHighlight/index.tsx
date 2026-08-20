import { useTranslation } from 'react-i18next';
import { ToolPanel } from '~root/components/tools';
import { HIGHLIGHT_MAX_LENGTH } from '~root/constants';
import type { RegexMatch } from '~root/types';

type Props = {
  testString: string;
  matches: RegexMatch[];
};

export const MatchHighlight = ({ testString, matches }: Props) => {
  const { t } = useTranslation('regex-tester');

  if (!testString || matches.length === 0) return null;

  if (testString.length > HIGHLIGHT_MAX_LENGTH) {
    return (
      <ToolPanel title={t('highlight.title')}>
        <p className="text-sm text-muted-foreground">{t('highlight.tooLarge')}</p>
      </ToolPanel>
    );
  }

  const segments: Array<{ text: string; isMatch: boolean }> = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.index > cursor) {
      segments.push({ text: testString.slice(cursor, match.index), isMatch: false });
    }
    segments.push({
      text: testString.slice(match.index, match.index + match.length),
      isMatch: true,
    });
    cursor = match.index + match.length;
  }
  if (cursor < testString.length) {
    segments.push({ text: testString.slice(cursor), isMatch: false });
  }

  return (
    <ToolPanel title={t('highlight.title')}>
      <pre className="max-h-64 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm whitespace-pre-wrap">
        {segments.map((segment, index) =>
          segment.isMatch ? (
            <mark
              key={index}
              className="rounded-sm bg-yellow-200/70 underline dark:bg-yellow-500/30"
            >
              {segment.text}
            </mark>
          ) : (
            <span key={index}>{segment.text}</span>
          ),
        )}
      </pre>
    </ToolPanel>
  );
};
