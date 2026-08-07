import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Card, CardContent } from '~root/components/ui/card';
import { Label } from '~root/components/ui/label';
import { Switch } from '~root/components/ui/switch';
import { Skeleton } from '~root/components/ui/skeleton';
import { useGetSettings } from '~root/apis/useGetSettings';
import { useUpdateSettings } from '~root/apis/useUpdateSettings';

export const NotificationsTab = () => {
  const { settings, isLoading } = useGetSettings();
  const { mutate: updateSettings } = useUpdateSettings();
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (settings) {
      // Mirrors the fetched setting into local state so the switch can toggle
      // optimistically and roll back on error; same pattern used in ProfilePage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmailNotifications(settings.emailNotifications);
    }
  }, [settings]);

  const handleToggle = (checked: boolean) => {
    setEmailNotifications(checked);
    updateSettings(
      { emailNotifications: checked },
      {
        onSuccess: () => toast.success('Đã lưu cài đặt.', { position: 'bottom-center' }),
        onError: () => {
          setEmailNotifications(!checked);
          toast.error('Lưu cài đặt thất bại.', { position: 'bottom-center' });
        },
      },
    );
  };

  if (isLoading) {
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
