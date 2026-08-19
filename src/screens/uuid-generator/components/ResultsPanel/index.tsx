import { Check, Copy, Download, Fingerprint, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Button, Card, CardContent, CardHeader, CardTitle } from '~root/components/ui';
import { UUIDVersion } from '~root/constants';

type Props = {
  results: string[];
  version: UUIDVersion;
  onClear: () => void;
};

export const ResultsPanel = ({ results, version, onClear }: Props) => {
  const { t } = useTranslation('uuid-generator');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyOne = async (uuid: string, index: number) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopiedIndex(index);
      window.setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current));
      }, 2000);
    } catch {
      toast.error(t('results.copyError'), { position: 'bottom-center' });
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(results.join('\n'));
      setCopiedAll(true);
      toast.success(t('results.copyAllSuccess'), { position: 'bottom-center' });
      window.setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      toast.error(t('results.copyError'), { position: 'bottom-center' });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([results.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'uuids.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 space-y-0">
        <CardTitle className="text-sm font-medium">{t('results.title')}</CardTitle>
        {results.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            aria-label={copiedAll ? t('results.copied') : t('results.copyAll')}
          >
            {copiedAll ? (
              <Check className="h-4 w-4 sm:mr-2" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4 sm:mr-2" aria-hidden="true" />
            )}
            <span className="hidden sm:inline" aria-hidden="true">
              {copiedAll ? t('results.copied') : t('results.copyAll')}
            </span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {results.length === 0 ? (
          <div className="flex h-80 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-sm text-muted-foreground">
            <Fingerprint className="h-8 w-8 opacity-50" aria-hidden="true" />
            <p>{t('emptyState.title')}</p>
            <p>{t('emptyState.description')}</p>
          </div>
        ) : (
          <>
            <ul className="max-h-96 divide-y overflow-y-auto rounded-md border">
              {results.map((uuid, index) => (
                <li
                  key={`${uuid}-${index}`}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <code className="min-w-0 flex-1 font-mono text-sm break-all">{uuid}</code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyOne(uuid, index)}
                    aria-label={
                      copiedIndex === index ? t('results.copied') : `${t('results.copy')} ${uuid}`
                    }
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                    )}
                    <span className="hidden sm:inline" aria-hidden="true">
                      {copiedIndex === index ? t('results.copied') : t('results.copy')}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>

            <div className="text-xs text-muted-foreground">
              <p>{t('results.countStat', { count: results.length })}</p>
              <p>
                {t('results.versionStat', {
                  version: version === 'v7' ? t('results.versionV7') : t('results.versionV4'),
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('results.download')}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={onClear}>
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('results.clear')}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
