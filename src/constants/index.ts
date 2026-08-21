export * from './endpoints';
export * from './regex';
export * from './markdown-preview';
export * from './unit-converter';
export * from './rest-api-client';
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

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum Language {
  VI = 'vi',
  EN = 'en',
}
export enum VerificationStatus {
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

export enum UUIDCase {
  LOWER = 'lower',
  UPPER = 'upper',
}

export enum UUIDVersion {
  V4 = 'v4',
  V7 = 'v7',
}

export enum ValidationReason {
  EMPTY = 'EMPTY',
  NOT_A_NUMBER = 'NOT_A_NUMBER',
  NOT_AN_INTEGER = 'NOT_AN_INTEGER',
  TOO_SMALL = 'TOO_SMALL',
  TOO_LARGE = 'TOO_LARGE',
  INVALID_TYPE = 'INVALID_TYPE',
}

export enum UuidVariant {
  RFC9562 = 'rfc9562',
  NCS = 'ncs',
  MICROSOFT = 'microsoft',
  FUTURE = 'future',
  UNKNOWN = 'unknown',
}

export enum ProcessingStatus {
  IDLE = 'idle',
  VALID = 'valid',
  INVALID = 'invalid',
  DONE = 'done',
  TIMEOUT = 'timeout',
  ERROR = 'error',
}

export const UPLOAD_ERROR_KEY = {
  EMPTY: 'input.uploadEmpty',
  TOO_LARGE: 'input.uploadTooLarge',
  INVALID_TYPE: 'input.uploadInvalidType',
} as const;

export enum ErrorCodes {
  EMPTY_TOKEN = 'EMPTY_TOKEN',
  INVALID_SEGMENT_COUNT = 'INVALID_SEGMENT_COUNT',
  INVALID_BASE64 = 'INVALID_BASE64',
  INVALID_JSON_HEADER = 'INVALID_JSON_HEADER',
  INVALID_JSON_PAYLOAD = 'INVALID_JSON_PAYLOAD',
  INVALID_PEM = 'INVALID_PEM',
  INVALID_URI_ENCODING = 'INVALID_URI_ENCODING',
  EMPTY_INPUT = 'EMPTY_INPUT',
  PARSE_ERROR = 'PARSE_ERROR',
  INVALID_TIMESTAMP = 'INVALID_TIMESTAMP',
  INVALID_DATE = 'INVALID_DATE',
  INVALID_HEX = 'INVALID_HEX',
  INVALID_RGB = 'INVALID_RGB',
  INVALID_HSL = 'INVALID_HSL',
  INVALID_COLOR_FORMAT = 'INVALID_COLOR_FORMAT',
  INVALID_NUMBER = 'INVALID_NUMBER',
  NEGATIVE_NOT_ALLOWED = 'NEGATIVE_NOT_ALLOWED',
  BELOW_ABSOLUTE_ZERO = 'BELOW_ABSOLUTE_ZERO',
  INVALID_URL = 'INVALID_URL',
  INVALID_JSON_BODY = 'INVALID_JSON_BODY',
  INVALID_HEADER_KEY = 'INVALID_HEADER_KEY',
  NETWORK_ERROR = 'NETWORK_ERROR',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  REQUEST_ABORTED = 'REQUEST_ABORTED',
}

export type ColumnAlign = 'left' | 'center' | 'right';
export type SortDirection = 'asc' | 'desc';
export type SignatureStatus = 'unknown' | 'valid' | 'invalid';

export type HmacAlgorithm = 'HS256' | 'HS384' | 'HS512';
export type RsaAlgorithm = 'RS256' | 'RS384' | 'RS512';
export type RsaPssAlgorithm = 'PS256' | 'PS384' | 'PS512';
export type EcdsaAlgorithm = 'ES256' | 'ES384' | 'ES512';

export type JwtAlgorithm = HmacAlgorithm | RsaAlgorithm | RsaPssAlgorithm | EcdsaAlgorithm;

export type SigningErrorCode = 'INVALID_KEY' | 'SIGNING_FAILED' | 'VERIFICATION_FAILED';

export type FormDialogMode = 'view' | 'edit';

export type TimezoneMode = 'UTC' | 'local';

export const DEBOUNCE_MS = 350;

export const WORKER_TIMEOUT_MS = 1500;

export const TEST_STRING_WARN_LENGTH = 50_000;

export const HIGHLIGHT_MAX_LENGTH = 20_000;

export enum OperationMode {
  ENCODE = 'encode',
  DECODE = 'decode',
}

export enum TimestampUnit {
  SECONDS = 'seconds',
  MILLISECONDS = 'milliseconds',
}

export enum TimestampConversionMode {
  TIMESTAMP_TO_DATE = 'timestampToDate',
  DATE_TO_TIMESTAMP = 'dateToTimestamp',
}

export enum UnitCategory {
  LENGTH = 'length',
  DATA = 'data',
  TIME = 'time',
  TEMPERATURE = 'temperature',
}
