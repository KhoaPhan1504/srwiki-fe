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
  TerminalSquare,
  User,
  Users,
} from 'lucide-react';
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
  {
    to: '/tools/jwt',
    labelKey: 'nav.jwtWebToken',
    icon: KeyRound,
    adminOnly: false,
    section: 'nav.sectionTools',
  },
  {
    to: '/tools/uuid-generator',
    labelKey: 'nav.uuidGenerator',
    icon: Fingerprint,
    adminOnly: false,
    section: 'nav.sectionTools',
  },
  {
    to: '/tools/regex-tester',
    labelKey: 'nav.regexTester',
    icon: Regex,
    adminOnly: false,
    section: 'nav.sectionTools',
  },
  {
    to: '/tools/markdown-preview',
    labelKey: 'nav.markdownPreview',
    icon: NotebookText,
    adminOnly: false,
    section: 'nav.sectionTools',
  },
  {
    to: '/tools/base64',
    labelKey: 'nav.base64EncoderDecoder',
    icon: Binary,
    adminOnly: false,
    section: 'nav.sectionTools',
  },
  {
    to: '/tools/url-encoder-decoder',
    labelKey: 'nav.urlEncoderDecoder',
    icon: Link,
    adminOnly: false,
    section: 'nav.sectionTools',
  },
  {
    to: '/tools/timestamp-converter',
    labelKey: 'nav.timestampConverter',
    icon: Clock,
    adminOnly: false,
    section: 'nav.sectionTools',
  },
  {
    to: '/tools/color-converter',
    labelKey: 'nav.colorConverter',
    icon: Palette,
    adminOnly: false,
    section: 'nav.sectionTools',
  },
  {
    to: '/tools/unit-converter',
    labelKey: 'nav.unitConverter',
    icon: Ruler,
    adminOnly: false,
    section: 'nav.sectionTools',
  },
  {
    to: '/tools/rest-api-client',
    labelKey: 'nav.restApiClient',
    icon: Send,
    adminOnly: false,
    section: 'nav.sectionTools',
  },
  {
    to: '/tools/curl-generator',
    labelKey: 'nav.curlGenerator',
    icon: TerminalSquare,
    adminOnly: false,
    section: 'nav.sectionTools',
  },
];
