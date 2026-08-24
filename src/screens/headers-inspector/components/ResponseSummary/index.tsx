import { useTranslation } from 'react-i18next';
import { Badge } from '~root/components/ui';
import type { HeaderInspectionResponse } from '~root/types';
import { formatResponseDuration } from '~root/utils';

type StatusBadgeVariant = 'success' | 'info' | 'warning' | 'destructive';

// Character-for-character duplicate of statusBadgeVariant in
// src/screens/rest-api-client/components/ResponsePanel/index.tsx. Kept as a
// local copy rather than extracted into a shared util — this codebase
// generally tolerates small per-tool duplication like this over premature
// shared abstractions.
const statusBadgeVariant = (status: number): StatusBadgeVariant => {
  if (status < 300) return 'success';
  if (status < 400) return 'info';
  if (status < 500) return 'warning';
  return 'destructive';
};

type Props = {
  response: HeaderInspectionResponse;
  requestUrl: string;
};

export const ResponseSummary = ({ response, requestUrl }: Props) => {
  const { t } = useTranslation('headers-inspector');
  // Only surface the final URL when a redirect actually changed it.
  const showFinalUrl = response.finalUrl !== requestUrl;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <Badge variant={statusBadgeVariant(response.statusCode)}>
        {response.statusCode} {response.reasonPhrase}
      </Badge>
      <span className="text-muted-foreground">
        {t('response.duration', { value: formatResponseDuration(response.durationMs) })}
      </span>
      {showFinalUrl && (
        <span className="text-muted-foreground">
          {t('response.finalUrl', { value: response.finalUrl })}
        </span>
      )}
      {response.redirectCount > 0 && (
        <span className="text-muted-foreground">
          {t('response.redirectCount', { count: response.redirectCount })}
        </span>
      )}
    </div>
  );
};
