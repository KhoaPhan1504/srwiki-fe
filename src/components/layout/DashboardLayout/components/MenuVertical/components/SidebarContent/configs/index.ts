import { Braces, LayoutDashboard, SettingsIcon, User, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type MenuOption = {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  adminOnly: boolean;
  section?: string;
};

export const MenuOptions: MenuOption[] = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, adminOnly: false },
  { to: '/profile', labelKey: 'nav.profile', icon: User, adminOnly: false },
  { to: '/settings', labelKey: 'nav.settings', icon: SettingsIcon, adminOnly: false },
  { to: '/admin/members', labelKey: 'nav.memberList', icon: Users, adminOnly: true },
  {
    to: '/tools/json-formatter',
    labelKey: 'nav.jsonFormatter',
    icon: Braces,
    adminOnly: false,
    section: 'nav.sectionTools',
  },
];
