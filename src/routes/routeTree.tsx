import type { ReactElement, ReactNode } from 'react';
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
  ScrollText,
  Send,
  SettingsIcon,
  TerminalSquare,
  User,
  Users,
} from 'lucide-react';
import AdminMembersPage from '~root/pages/AdminMembers';
import Base64EncoderDecoderPage from '~root/pages/Base64EncoderDecoder';
import ColorConverterPage from '~root/pages/ColorConverter';
import CurlGeneratorPage from '~root/pages/CurlGenerator';
import DashboardPage from '~root/pages/Dashboard';
import HeadersInspectorPage from '~root/pages/HeadersInspector';
import JsonFormatterPage from '~root/pages/JsonFormatter';
import JwtWebTokenPage from '~root/pages/JwtWebToken';
import MarkdownPreviewPage from '~root/pages/MarkdownPreview';
import ProfilePage from '~root/pages/Profile';
import RegexTesterPage from '~root/pages/RegexTester';
import RestApiClientPage from '~root/pages/RestApiClient';
import SettingsPage from '~root/pages/Settings';
import TimestampConverterPage from '~root/pages/TimestampConverter';
import UnitConverterPage from '~root/pages/UnitConverter';
import UrlEncoderDecoderPage from '~root/pages/UrlEncoderDecoder';
import UuidGeneratorPage from '~root/pages/UuidGenerator';

export type RouteType = {
  title: string;
  path?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  element?: ReactElement;
  children?: RouteType[];
  adminOnly?: boolean;
};

export const getNodeKey = (item: RouteType): string => item.path ?? item.title;

const iconClass = 'h-4 w-4';

export const protectedRouteTree: RouteType[] = [
  {
    title: 'nav.dashboard',
    path: '/dashboard',
    prefix: <LayoutDashboard className={iconClass} />,
    element: <DashboardPage />,
  },
  {
    title: 'nav.profile',
    path: '/profile',
    prefix: <User className={iconClass} />,
    element: <ProfilePage />,
  },
  {
    title: 'nav.settings',
    path: '/settings',
    prefix: <SettingsIcon className={iconClass} />,
    element: <SettingsPage />,
  },
  {
    title: 'nav.memberList',
    path: '/admin/members',
    prefix: <Users className={iconClass} />,
    element: <AdminMembersPage />,
    adminOnly: true,
  },
  {
    title: 'nav.sectionTools',
    children: [
      {
        title: 'nav.jsonFormatter',
        path: '/tools/json-formatter',
        prefix: <Braces className={iconClass} />,
        element: <JsonFormatterPage />,
      },
      {
        title: 'nav.jwtWebToken',
        path: '/tools/jwt',
        prefix: <KeyRound className={iconClass} />,
        element: <JwtWebTokenPage />,
      },
      {
        title: 'nav.uuidGenerator',
        path: '/tools/uuid-generator',
        prefix: <Fingerprint className={iconClass} />,
        element: <UuidGeneratorPage />,
      },
      {
        title: 'nav.regexTester',
        path: '/tools/regex-tester',
        prefix: <Regex className={iconClass} />,
        element: <RegexTesterPage />,
      },
      {
        title: 'nav.markdownPreview',
        path: '/tools/markdown-preview',
        prefix: <NotebookText className={iconClass} />,
        element: <MarkdownPreviewPage />,
      },
      {
        title: 'nav.base64EncoderDecoder',
        path: '/tools/base64',
        prefix: <Binary className={iconClass} />,
        element: <Base64EncoderDecoderPage />,
      },
      {
        title: 'nav.urlEncoderDecoder',
        path: '/tools/url-encoder-decoder',
        prefix: <Link className={iconClass} />,
        element: <UrlEncoderDecoderPage />,
      },
      {
        title: 'nav.timestampConverter',
        path: '/tools/timestamp-converter',
        prefix: <Clock className={iconClass} />,
        element: <TimestampConverterPage />,
      },
      {
        title: 'nav.colorConverter',
        path: '/tools/color-converter',
        prefix: <Palette className={iconClass} />,
        element: <ColorConverterPage />,
      },
      {
        title: 'nav.unitConverter',
        path: '/tools/unit-converter',
        prefix: <Ruler className={iconClass} />,
        element: <UnitConverterPage />,
      },
    ],
  },
  {
    title: 'nav.sectionDevelopment',
    children: [
      {
        title: 'nav.restApiClient',
        path: '/tools/rest-api-client',
        prefix: <Send className={iconClass} />,
        element: <RestApiClientPage />,
      },
      {
        title: 'nav.curlGenerator',
        path: '/tools/curl-generator',
        prefix: <TerminalSquare className={iconClass} />,
        element: <CurlGeneratorPage />,
      },
      {
        title: 'nav.headersInspector',
        path: '/tools/headers-inspector',
        prefix: <ScrollText className={iconClass} />,
        element: <HeadersInspectorPage />,
      },
    ],
  },
];
