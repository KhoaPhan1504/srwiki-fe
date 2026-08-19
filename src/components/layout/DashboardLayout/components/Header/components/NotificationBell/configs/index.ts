import { Bell, Phone, SettingsIcon, ShieldAlert, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NotificationTypeConfig = { icon: LucideIcon; colorVar: string };

export const NOTIFICATION_TYPE_CONFIG: Record<string, NotificationTypeConfig> = {
  phone_verified: { icon: Phone, colorVar: '--chart-1' },
  avatar_updated: { icon: UserRound, colorVar: '--chart-2' },
  settings_updated: { icon: SettingsIcon, colorVar: '--chart-3' },
  new_device_login: { icon: ShieldAlert, colorVar: '--chart-4' },
};

export const DEFAULT_NOTIFICATION_TYPE_CONFIG: NotificationTypeConfig = {
  icon: Bell,
  colorVar: '--chart-1',
};
