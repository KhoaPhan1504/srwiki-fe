import { LayoutDashboard, SettingsIcon, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  keywords?: string[];
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'Hồ sơ', to: '/profile', icon: User },
  { id: 'settings', label: 'Cài đặt', to: '/settings', icon: SettingsIcon },
  {
    id: 'settings-general',
    label: 'Cài đặt · Chung',
    to: '/settings?tab=general',
    icon: SettingsIcon,
  },
  {
    id: 'settings-appearance',
    label: 'Cài đặt · Giao diện',
    to: '/settings?tab=appearance',
    icon: SettingsIcon,
  },
  {
    id: 'settings-notifications',
    label: 'Cài đặt · Thông báo',
    to: '/settings?tab=notifications',
    icon: SettingsIcon,
  },
  {
    id: 'settings-account',
    label: 'Cài đặt · Tài khoản',
    to: '/settings?tab=account',
    icon: SettingsIcon,
  },
];
