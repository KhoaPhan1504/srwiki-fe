import { CalendarCheck, Mail, Phone, UserRound, type LucideIcon } from 'lucide-react';
import type { Profile } from '~root/apis';
import { Badge } from '~root/components/ui';
import { PhoneVerificationStatus } from '~root/constants';
import { formatDate } from '~root/utils';

// ---- Config for stat cards ----
export type StatCardConfig = {
  key: string;
  title: string;
  icon: LucideIcon;
  renderContent: (ctx: { profile: Profile; completionPercent: number }) => React.ReactNode;
  contentClassName?: string;
  badgeColorVar: string;
};

export const STAT_CARDS: StatCardConfig[] = [
  {
    key: 'memberSince',
    title: 'Thành viên từ',
    icon: CalendarCheck,
    renderContent: ({ profile }) => formatDate(profile.createdAt),
    badgeColorVar: '--chart-1',
  },
  {
    key: 'profileCompletion',
    title: 'Hồ sơ hoàn thiện',
    icon: UserRound,
    renderContent: ({ completionPercent }) => `${completionPercent}%`,
    badgeColorVar: '--chart-2',
  },
  {
    key: 'phone',
    title: 'Số điện thoại',
    icon: Phone,
    renderContent: ({ profile }) => (
      <Badge variant={profile.phoneVerified ? 'verify-primary' : 'destructive'}>
        {profile.phoneVerified
          ? PhoneVerificationStatus.VERIFIED
          : PhoneVerificationStatus.UNVERIFIED}
      </Badge>
    ),
    badgeColorVar: '--chart-3',
  },
  {
    key: 'email',
    title: 'Email',
    icon: Mail,
    renderContent: ({ profile }) => profile.email,
    contentClassName: 'truncate text-2xl font-bold',
    badgeColorVar: '--chart-4',
  },
];

// ---- Config for account info fields ----
export type AccountInfoField = {
  key: string;
  label: string;
  getValue: (profile: Profile) => React.ReactNode;
};

export const ACCOUNT_INFO_FIELDS: AccountInfoField[] = [
  { key: 'fullName', label: 'Họ và tên', getValue: (profile) => profile.fullName || '—' },
  { key: 'email', label: 'Email', getValue: (profile) => profile.email },
  { key: 'phone', label: 'Số điện thoại', getValue: (profile) => profile.phone || '—' },
  { key: 'address', label: 'Địa chỉ', getValue: (profile) => profile.address || '—' },
];

// ---- Config for quick links ----
export type QuickLink = {
  key: string;
  to: string;
  label: string;
};

export const QUICK_LINKS: QuickLink[] = [
  { key: 'editProfile', to: '/profile', label: 'Chỉnh sửa hồ sơ' },
  { key: 'settings', to: '/settings', label: 'Cài đặt tài khoản' },
];

// ---- Config for profile completion fields ----
export const COMPLETION_FIELDS: (keyof Pick<
  Profile,
  'avatarUrl' | 'bio' | 'address' | 'dateOfBirth' | 'phoneVerified'
>)[] = ['avatarUrl', 'bio', 'address', 'dateOfBirth', 'phoneVerified'];
