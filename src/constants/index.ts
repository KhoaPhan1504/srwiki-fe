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
} as const;

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum DashboardTab {
  MEMBER_SINCE = 'Thành viên từ',
  PROFILE_COMPLETION = 'Hồ sơ hoàn thiện',
  PHONE_NUMBER = 'Số điện thoại',
  EMAIL = 'Email',
}

export enum PhoneVerificationStatus {
  VERIFIED = 'Đã xác thực',
  UNVERIFIED = 'Chưa xác thực',
}