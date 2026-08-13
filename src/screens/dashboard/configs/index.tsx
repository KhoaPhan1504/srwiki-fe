import { CalendarCheck, Mail, Phone, UserRound, type LucideIcon } from 'lucide-react';
import type { TFunction } from 'i18next';
import type { Profile } from '~root/apis';
import { Badge } from '~root/components/ui';
import { PhoneVerificationStatus } from '~root/constants';
import { formatDate } from '~root/utils';

// ---- Config for stat cards ----
export type StatCardConfig = {
  key: string;
  titleKey: string;
  icon: LucideIcon;
  renderContent: (ctx: {
    profile: Profile;
    completionPercent: number;
    t: TFunction;
  }) => React.ReactNode;
  contentClassName?: string;
  badgeColorVar: string;
};

export const STAT_CARDS: StatCardConfig[] = [
  {
    key: 'memberSince',
    titleKey: 'stats.memberSince',
    icon: CalendarCheck,
    renderContent: ({ profile }) => formatDate(profile.createdAt),
    badgeColorVar: '--chart-1',
  },
  {
    key: 'profileCompletion',
    titleKey: 'stats.profileCompletion',
    icon: UserRound,
    renderContent: ({ completionPercent }) => `${completionPercent}%`,
    badgeColorVar: '--chart-2',
  },
  {
    key: 'phone',
    titleKey: 'stats.phone',
    icon: Phone,
    renderContent: ({ profile, t }) => (
      <Badge variant={profile.phoneVerified ? 'verify-primary' : 'destructive'}>
        {t(
          `phoneStatus.${
            profile.phoneVerified
              ? PhoneVerificationStatus.VERIFIED
              : PhoneVerificationStatus.UNVERIFIED
          }`,
        )}
      </Badge>
    ),
    badgeColorVar: '--chart-3',
  },
  {
    key: 'email',
    titleKey: 'stats.email',
    icon: Mail,
    renderContent: ({ profile }) => profile.email,
    contentClassName: 'truncate text-2xl font-bold',
    badgeColorVar: '--chart-4',
  },
];

// ---- Config for account info fields ----
export type AccountInfoField = {
  key: string;
  labelKey: string;
  getValue: (profile: Profile) => React.ReactNode;
};

export const ACCOUNT_INFO_FIELDS: AccountInfoField[] = [
  {
    key: 'fullName',
    labelKey: 'accountInfo.fullName',
    getValue: (profile) => profile.fullName || '—',
  },
  { key: 'email', labelKey: 'accountInfo.email', getValue: (profile) => profile.email },
  { key: 'phone', labelKey: 'accountInfo.phone', getValue: (profile) => profile.phone || '—' },
  {
    key: 'address',
    labelKey: 'accountInfo.address',
    getValue: (profile) => profile.address || '—',
  },
];

// ---- Config for quick links ----
export type QuickLink = {
  key: string;
  to: string;
  labelKey: string;
};

export const QUICK_LINKS: QuickLink[] = [
  { key: 'editProfile', to: '/profile', labelKey: 'quickLinks.editProfile' },
  { key: 'settings', to: '/settings', labelKey: 'quickLinks.settings' },
];

// ---- Config for profile completion fields ----
export const COMPLETION_FIELDS: (keyof Pick<
  Profile,
  'avatarUrl' | 'bio' | 'address' | 'dateOfBirth' | 'phoneVerified'
>)[] = ['avatarUrl', 'bio', 'address', 'dateOfBirth', 'phoneVerified'];
