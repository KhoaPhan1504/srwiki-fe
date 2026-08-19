import { ValidationReason, UUIDCase, UuidVariant, UUIDVersion } from '~root/constants';

export type FormatOptions = {
  case: UUIDCase;
  removeHyphens: boolean;
};

export const generateUuidV4 = (): string => crypto.randomUUID();

const bytesToUuidString = (bytes: Uint8Array): string => {
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export const generateUuidV7 = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  const timestampMs = BigInt(Date.now());
  for (let i = 0; i < 6; i += 1) {
    bytes[5 - i] = Number((timestampMs >> BigInt(i * 8)) & 0xffn);
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return bytesToUuidString(bytes);
};

export const generateUuid = (version: UUIDVersion): string =>
  version === UUIDVersion.V7 ? generateUuidV7() : generateUuidV4();

export const formatUuid = (uuid: string, options: FormatOptions): string => {
  const cased = options.case === UUIDCase.UPPER ? uuid.toUpperCase() : uuid.toLowerCase();
  return options.removeHyphens ? cased.replace(/-/g, '') : cased;
};

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 100;
export const DEFAULT_QUANTITY = 5;

export type QuantityValidation =
  | { valid: true; value: number }
  | {
      valid: false;
      reason: ValidationReason;
    };

export const validateQuantity = (input: string): QuantityValidation => {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, reason: ValidationReason.EMPTY };

  const value = Number(trimmed);
  if (Number.isNaN(value)) return { valid: false, reason: ValidationReason.NOT_A_NUMBER };
  if (!Number.isInteger(value)) return { valid: false, reason: ValidationReason.NOT_AN_INTEGER };
  if (value < MIN_QUANTITY) return { valid: false, reason: ValidationReason.TOO_SMALL };
  if (value > MAX_QUANTITY) return { valid: false, reason: ValidationReason.TOO_LARGE };

  return { valid: true, value };
};

const CANONICAL_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX32_REGEX = /^[0-9a-f]{32}$/i;

const toCanonicalForm = (input: string): string | null => {
  const trimmed = input.trim();
  if (CANONICAL_UUID_REGEX.test(trimmed)) return trimmed.toLowerCase();
  if (HEX32_REGEX.test(trimmed)) {
    const hex = trimmed.toLowerCase();
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return null;
};

const getVariant = (nibble: number): UuidVariant => {
  if ((nibble & 0b1000) === 0b0000) return UuidVariant.NCS;
  if ((nibble & 0b1100) === 0b1000) return UuidVariant.RFC9562;
  if ((nibble & 0b1110) === 0b1100) return UuidVariant.MICROSOFT;
  if ((nibble & 0b1110) === 0b1110) return UuidVariant.FUTURE;
  return UuidVariant.UNKNOWN;
};

export type UuidInfo =
  | { valid: true; version: number; variant: UuidVariant; timestampMs: number | null }
  | { valid: false };

export const parseUuidInfo = (input: string): UuidInfo => {
  const canonical = toCanonicalForm(input);
  if (!canonical) return { valid: false };

  const hex = canonical.replace(/-/g, '');
  const version = parseInt(hex.charAt(12), 16);
  const variant = getVariant(parseInt(hex.charAt(16), 16));
  const timestampMs =
    version === 7 && variant === UuidVariant.RFC9562
      ? Number(BigInt(`0x${hex.slice(0, 12)}`))
      : null;

  return { valid: true, version, variant, timestampMs };
};
