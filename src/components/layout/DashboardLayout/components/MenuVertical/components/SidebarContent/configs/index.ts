import { LayoutDashboard, SettingsIcon, User } from 'lucide-react';

export const MenuOptions = [
  { to: '/dashboard', labelKey: 'nav.dashboard' as const, icon: LayoutDashboard },
  { to: '/profile', labelKey: 'nav.profile' as const, icon: User },
  { to: '/settings', labelKey: 'nav.settings' as const, icon: SettingsIcon },
];
