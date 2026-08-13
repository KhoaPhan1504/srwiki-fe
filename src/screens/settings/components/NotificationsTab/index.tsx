import { useTranslation } from 'react-i18next';
import { QueryErrorCard } from '~root/components/common';
import { useNotificationsTabHooks } from './hooks';
import { Card, CardContent, Label, Skeleton, Switch } from '~root/components/ui';

export const NotificationsTab = () => {
  const { t } = useTranslation('settings-notifications');
  const { settings, isLoading, isError, refetch, emailNotifications, handleToggle } =
    useNotificationsTabHooks();

  if (isError) {
    return <QueryErrorCard message={t('error')} onRetry={() => refetch()} />;
  }

  if (isLoading || !settings) {
    return <Skeleton className="h-24" />;
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <Label htmlFor="email-notifications">{t('emailLabel')}</Label>
          <p className="text-sm text-muted-foreground">{t('emailHint')}</p>
        </div>
        <Switch
          id="email-notifications"
          checked={emailNotifications}
          onCheckedChange={handleToggle}
        />
      </CardContent>
    </Card>
  );
};
