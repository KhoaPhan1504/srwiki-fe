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
  PROFILE_PHONE_SEND_OTP: '/profile/phone/send-otp',
  PROFILE_PHONE_VERIFY_OTP: '/profile/phone/verify-otp',
} as const;
