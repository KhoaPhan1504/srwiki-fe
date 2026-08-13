import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~root/components/ui/dropdown-menu';
import { Button } from '~root/components/ui/button';
import { useGetNotifications } from '~root/apis/useGetNotifications';
import { useMarkNotificationRead } from '~root/apis/useMarkNotificationRead';
import { useMarkAllNotificationsRead } from '~root/apis/useMarkAllNotificationsRead';
import { useNotificationsRealtime } from '~root/apis/useNotificationsRealtime';
import { getDateFnsLocale } from '~root/i18n/dateLocale';
import type { Language } from '~root/constants';
import { DEFAULT_NOTIFICATION_TYPE_CONFIG, NOTIFICATION_TYPE_CONFIG } from './configs';

export const NotificationBell = () => {
  const { t, i18n } = useTranslation('notifications');
  useNotificationsRealtime();
  const { notifications } = useGetNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {badgeLabel}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-medium">{t('title')}</span>
          {unreadCount > 0 && (
            <DropdownMenuItem
              onClick={() => markAllRead()}
              className="w-auto px-2 py-1 text-xs text-muted-foreground"
            >
              {t('markAllRead')}
            </DropdownMenuItem>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">{t('empty')}</p>
          )}
          {notifications.map((notification) => {
            const config =
              NOTIFICATION_TYPE_CONFIG[notification.type] ?? DEFAULT_NOTIFICATION_TYPE_CONFIG;
            const Icon = config.icon;
            return (
              <DropdownMenuItem
                key={notification.id}
                onSelect={(e) => {
                  e.preventDefault();
                  if (!notification.readAt) markRead(notification.id);
                }}
                className="items-start gap-3 rounded-md px-2 py-2"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `color-mix(in oklch, var(${config.colorVar}) 15%, transparent)`,
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: `var(${config.colorVar})` }} />
                </span>
                <span className="flex-1 space-y-0.5">
                  <span
                    className={`block text-sm ${notification.readAt ? 'font-normal' : 'font-semibold'}`}
                  >
                    {notification.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {notification.message}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: getDateFnsLocale(i18n.language as Language),
                    })}
                  </span>
                </span>
                {!notification.readAt && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
