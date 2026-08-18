export type JwtHeader = Record<string, unknown>;
export type JwtPayload = Record<string, unknown>;

export type DecodedJwt = {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  segments: { header: string; payload: string; signature: string };
};

export type DecodeErrorCode =
  | 'EMPTY_TOKEN'
  | 'INVALID_SEGMENT_COUNT'
  | 'INVALID_BASE64'
  | 'INVALID_JSON_HEADER'
  | 'INVALID_JSON_PAYLOAD';

export type DecodeError = { code: DecodeErrorCode; message: string };

export type DecodeResult =
  { success: true; data: DecodedJwt } | { success: false; error: DecodeError };

export const normalizeToken = (raw: string): string => raw.replace(/\s+/g, '');

export const splitSegments = (token: string): string[] => token.split('.');

export const base64UrlDecodeBytes = (segment: string): Uint8Array => {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const paddingNeeded = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(paddingNeeded);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

export const base64UrlDecode = (segment: string): string =>
  new TextDecoder().decode(base64UrlDecodeBytes(segment));

export const base64UrlEncode = (data: ArrayBuffer | Uint8Array): string => {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const base64UrlEncodeText = (text: string): string =>
  base64UrlEncode(new TextEncoder().encode(text));

const PEM_LINE_LENGTH = 64;

export type PemErrorCode = 'INVALID_PEM';
export type PemError = { code: PemErrorCode; message: string };
export type PemParseResult =
  { success: true; data: ArrayBuffer } | { success: false; error: PemError };

export const parsePem = (pem: string): PemParseResult => {
  const match = pem.match(/-----BEGIN [^-]+-----([\s\S]+?)-----END [^-]+-----/);
  if (!match) {
    return {
      success: false,
      error: { code: 'INVALID_PEM', message: 'Missing PEM header/footer.' },
    };
  }

  const base64 = match[1].replace(/\s+/g, '');
  if (!base64) {
    return { success: false, error: { code: 'INVALID_PEM', message: 'PEM body is empty.' } };
  }

  try {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return { success: true, data: bytes.buffer };
  } catch (err) {
    return {
      success: false,
      error: { code: 'INVALID_PEM', message: err instanceof Error ? err.message : String(err) },
    };
  }
};

export const formatPem = (buffer: ArrayBuffer, label: string): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const base64 = btoa(binary);
  const lines = base64.match(new RegExp(`.{1,${PEM_LINE_LENGTH}}`, 'g')) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
};

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

const isJsonObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const decodeSegmentAsJsonObject = (
  segment: string,
  errorCode: 'INVALID_BASE64' | 'INVALID_JSON_HEADER' | 'INVALID_JSON_PAYLOAD',
): { success: true; data: Record<string, unknown> } | { success: false; error: DecodeError } => {
  let decoded: string;
  try {
    decoded = base64UrlDecode(segment);
  } catch (err) {
    return { success: false, error: { code: 'INVALID_BASE64', message: errorMessage(err) } };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch (err) {
    return { success: false, error: { code: errorCode, message: errorMessage(err) } };
  }

  if (!isJsonObject(parsed)) {
    return { success: false, error: { code: errorCode, message: 'Expected a JSON object.' } };
  }

  return { success: true, data: parsed };
};

export const decodeJwt = (rawToken: string): DecodeResult => {
  const normalized = normalizeToken(rawToken);
  if (!normalized) {
    return { success: false, error: { code: 'EMPTY_TOKEN', message: 'Token is empty.' } };
  }

  const segments = splitSegments(normalized);
  if (segments.length !== 3) {
    return {
      success: false,
      error: {
        code: 'INVALID_SEGMENT_COUNT',
        message: `Expected 3 segments, got ${segments.length}.`,
      },
    };
  }

  const [headerSegment, payloadSegment, signatureSegment] = segments;

  const header = decodeSegmentAsJsonObject(headerSegment, 'INVALID_JSON_HEADER');
  if (!header.success) return header;

  const payload = decodeSegmentAsJsonObject(payloadSegment, 'INVALID_JSON_PAYLOAD');
  if (!payload.success) return payload;

  return {
    success: true,
    data: {
      header: header.data,
      payload: payload.data,
      signature: signatureSegment,
      segments: { header: headerSegment, payload: payloadSegment, signature: signatureSegment },
    },
  };
};

export type StandardClaims = {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export const extractClaims = (payload: JwtPayload): StandardClaims => {
  const claims: StandardClaims = {};
  if (typeof payload.iss === 'string') claims.iss = payload.iss;
  if (typeof payload.sub === 'string') claims.sub = payload.sub;
  if (typeof payload.aud === 'string' || isStringArray(payload.aud)) {
    claims.aud = payload.aud as string | string[];
  }
  if (typeof payload.exp === 'number') claims.exp = payload.exp;
  if (typeof payload.nbf === 'number') claims.nbf = payload.nbf;
  if (typeof payload.iat === 'number') claims.iat = payload.iat;
  if (typeof payload.jti === 'string') claims.jti = payload.jti;
  return claims;
};

export const numericDateToDate = (numericDate: number): Date => new Date(numericDate * 1000);

export type TokenStatus =
  | { state: 'no-expiration' }
  | { state: 'active'; expiresAt: Date }
  | { state: 'expired'; expiredAt: Date }
  | { state: 'not-yet-valid'; startsAt: Date };

export const getTokenStatus = (claims: StandardClaims, now: number = Date.now()): TokenStatus => {
  if (typeof claims.nbf === 'number') {
    const startsAt = numericDateToDate(claims.nbf);
    if (now < startsAt.getTime()) {
      return { state: 'not-yet-valid', startsAt };
    }
  }

  if (typeof claims.exp === 'number') {
    const expDate = numericDateToDate(claims.exp);
    if (now >= expDate.getTime()) {
      return { state: 'expired', expiredAt: expDate };
    }
    return { state: 'active', expiresAt: expDate };
  }

  return { state: 'no-expiration' };
};
