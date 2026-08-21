import {
  Binary,
  Braces,
  Clock,
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  Link,
  NotebookText,
  Palette,
  Regex,
  Ruler,
  Send,
  SettingsIcon,
  User,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  id: string;
  labelKey: string;
  to: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', to: '/dashboard', icon: LayoutDashboard },
  { id: 'profile', labelKey: 'nav.profile', to: '/profile', icon: User },
  { id: 'settings', labelKey: 'nav.settings', to: '/settings', icon: SettingsIcon },
  {
    id: 'settings-general',
    labelKey: 'nav.settingsGeneral',
    to: '/settings?tab=general',
    icon: SettingsIcon,
  },
  {
    id: 'settings-appearance',
    labelKey: 'nav.settingsAppearance',
    to: '/settings?tab=appearance',
    icon: SettingsIcon,
  },
  {
    id: 'settings-notifications',
    labelKey: 'nav.settingsNotifications',
    to: '/settings?tab=notifications',
    icon: SettingsIcon,
  },
  {
    id: 'settings-account',
    labelKey: 'nav.settingsAccount',
    to: '/settings?tab=account',
    icon: SettingsIcon,
  },
  {
    id: 'admin-members',
    labelKey: 'nav.memberList',
    to: '/admin/members',
    icon: Users,
    adminOnly: true,
  },
  {
    id: 'json-formatter',
    labelKey: 'nav.jsonFormatter',
    to: '/tools/json-formatter',
    icon: Braces,
  },
  {
    id: 'jwt-web-token',
    labelKey: 'nav.jwtWebToken',
    to: '/tools/jwt',
    icon: KeyRound,
  },
  {
    id: 'uuid-generator',
    labelKey: 'nav.uuidGenerator',
    to: '/tools/uuid-generator',
    icon: Fingerprint,
  },
  {
    id: 'regex-tester',
    labelKey: 'nav.regexTester',
    to: '/tools/regex-tester',
    icon: Regex,
  },
  {
    id: 'markdown-preview',
    labelKey: 'nav.markdownPreview',
    to: '/tools/markdown-preview',
    icon: NotebookText,
  },
  {
    id: 'base64-encoder-decoder',
    labelKey: 'nav.base64EncoderDecoder',
    to: '/tools/base64',
    icon: Binary,
  },
  {
    id: 'url-encoder-decoder',
    labelKey: 'nav.urlEncoderDecoder',
    to: '/tools/url-encoder-decoder',
    icon: Link,
  },
  {
    id: 'timestamp-converter',
    labelKey: 'nav.timestampConverter',
    to: '/tools/timestamp-converter',
    icon: Clock,
  },
  {
    id: 'color-converter',
    labelKey: 'nav.colorConverter',
    to: '/tools/color-converter',
    icon: Palette,
  },
  {
    id: 'unit-converter',
    labelKey: 'nav.unitConverter',
    to: '/tools/unit-converter',
    icon: Ruler,
  },
  {
    id: 'rest-api-client',
    labelKey: 'nav.restApiClient',
    to: '/tools/rest-api-client',
    icon: Send,
  },
];
