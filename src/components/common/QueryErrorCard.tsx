import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '~root/components/ui/card';
import { Button } from '~root/components/ui/button';

type QueryErrorCardProps = {
  message: string;
  onRetry: () => void;
};

/**
 * Shared error state for pages/tabs backed by a single `useQuery` call.
 * React Query sets `isLoading: false` once retries are exhausted even though
 * `data` stays undefined, so screens that only guard on `isLoading || !data`
 * get stuck on a permanent loading skeleton after a real fetch failure. Use
 * this wherever that guard exists, gated on the hook's `isError` flag.
 */
export const QueryErrorCard = ({ message, onRetry }: QueryErrorCardProps) => {
  const { t } = useTranslation('common');
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button type="button" variant="outline" onClick={onRetry}>
          {t('buttons.retry')}
        </Button>
      </CardContent>
    </Card>
  );
};
