import { QueryErrorCard } from '~root/components/common';
import { useNotificationsTabHooks } from './hooks';
import { Card, CardContent, Label, Skeleton, Switch } from '~root/components/ui';

export const NotificationsTab = () => {
  const { settings, isLoading, isError, refetch, emailNotifications, handleToggle } =
    useNotificationsTabHooks();

  if (isError) {
    return <QueryErrorCard message="Không thể tải cài đặt thông báo." onRetry={() => refetch()} />;
  }

  if (isLoading || !settings) {
    return <Skeleton className="h-24" />;
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <Label htmlFor="email-notifications">Nhận email thông báo</Label>
          <p className="text-sm text-muted-foreground">
            Nhận email khi có hoạt động quan trọng trên tài khoản.
          </p>
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
