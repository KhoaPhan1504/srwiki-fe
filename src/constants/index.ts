// Vite substitutes this at build time. If it is missing the axios client would
// fall back to `baseURL: undefined` and quietly resolve every request against
// the page's own origin -- which surfaces as bogus 200s and fake "wrong
// password" errors rather than an obvious misconfiguration. Fail loudly at
// module load instead.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is not set — see .env.template');
}

export const API_URL: string = apiBaseUrl;

// Unlike API_URL, Supabase Realtime is a nice-to-have layered on top of a
// notification list that already loads fine over httpClient/axios. Since this
// module is imported almost everywhere (transitively via http-client.ts),
// throwing here would white-screen the entire app — including the login page
// — over a missing "live badge update" nicety. Degrade gracefully instead:
// warn once and let consumers (supabase-realtime-client.ts) treat these as
// optional.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY is not set — see .env.template. Realtime notifications will be disabled.',
  );
}

export const SUPABASE_URL: string | null = supabaseUrl || null;
export const SUPABASE_ANON_KEY: string | null = supabaseAnonKey || null;

export const Endpoints = {
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  PROFILE: '/profile',
  PROFILE_AVATAR: '/profile/avatar',
  PROFILE_PHONE_SEND_OTP: '/profile/phone/send-otp',
  PROFILE_PHONE_VERIFY_OTP: '/profile/phone/verify-otp',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  ADMIN_MEMBERS: '/admin/members',
  ADMIN_ADMINS: '/admin/admins',
} as const;

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum Language {
  VI = 'vi',
  EN = 'en',
}

export enum DashboardTab {
  MEMBER_SINCE = 'Thành viên từ',
  PROFILE_COMPLETION = 'Hồ sơ hoàn thiện',
  PHONE_NUMBER = 'Số điện thoại',
  EMAIL = 'Email',
}

export enum PhoneVerificationStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
}

export const TIMEZONES = [
  'Asia/Ho_Chi_Minh',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
];

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum MembershipTier {
  REGULAR = 'regular',
  VIP = 'vip',
}
