import { LayoutDashboard, SettingsIcon, User, Users } from 'lucide-react';

export const MenuOptions = [
  { to: '/dashboard', labelKey: 'nav.dashboard' as const, icon: LayoutDashboard, adminOnly: false },
  { to: '/profile', labelKey: 'nav.profile' as const, icon: User, adminOnly: false },
  { to: '/settings', labelKey: 'nav.settings' as const, icon: SettingsIcon, adminOnly: false },
  { to: '/admin/members', labelKey: 'nav.memberList' as const, icon: Users, adminOnly: true },
];
