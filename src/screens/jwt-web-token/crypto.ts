import { base64UrlDecodeBytes, base64UrlEncode, base64UrlEncodeText, parsePem } from './utils';
import type { JwtHeader, JwtPayload } from './utils';

export type JwtAlgorithm =
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'PS256'
  | 'PS384'
  | 'PS512'
  | 'ES256'
  | 'ES384'
  | 'ES512';

export type HmacAlgorithm = 'HS256' | 'HS384' | 'HS512';
export type RsaAlgorithm = 'RS256' | 'RS384' | 'RS512';
export type RsaPssAlgorithm = 'PS256' | 'PS384' | 'PS512';
export type EcdsaAlgorithm = 'ES256' | 'ES384' | 'ES512';

export type SigningErrorCode = 'INVALID_KEY' | 'SIGNING_FAILED' | 'VERIFICATION_FAILED';
export type SigningError = { code: SigningErrorCode; message: string };

export type SignResult =
  { success: true; signature: string } | { success: false; error: SigningError };
export type VerifyResult =
  { success: true; valid: boolean } | { success: false; error: SigningError };

const HMAC_HASH: Record<HmacAlgorithm, string> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
};

const RSA_HASH: Record<RsaAlgorithm, string> = {
  RS256: 'SHA-256',
  RS384: 'SHA-384',
  RS512: 'SHA-512',
};

const RSA_PSS_HASH: Record<RsaPssAlgorithm, string> = {
  PS256: 'SHA-256',
  PS384: 'SHA-384',
  PS512: 'SHA-512',
};

// RFC 7518 §3.5: the PSS salt length must equal the hash's output size.
const RSA_PSS_SALT_LENGTH: Record<RsaPssAlgorithm, number> = {
  PS256: 32,
  PS384: 48,
  PS512: 64,
};

const ECDSA_HASH: Record<EcdsaAlgorithm, string> = {
  ES256: 'SHA-256',
  ES384: 'SHA-384',
  ES512: 'SHA-512',
};

// ES512 pairs with curve P-521, not P-512 — there is no such curve.
const ECDSA_CURVE: Record<EcdsaAlgorithm, string> = {
  ES256: 'P-256',
  ES384: 'P-384',
  ES512: 'P-521',
};

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

type KeyImportResult = { success: true; key: CryptoKey } | { success: false; error: SigningError };

const importPemKey = async (
  pem: string,
  format: 'pkcs8' | 'spki',
  algorithm: RsaHashedImportParams | EcKeyImportParams,
  usage: 'sign' | 'verify',
): Promise<KeyImportResult> => {
  const parsed = parsePem(pem);
  if (!parsed.success) {
    return { success: false, error: { code: 'INVALID_KEY', message: parsed.error.message } };
  }
  try {
    const key = await crypto.subtle.importKey(format, parsed.data, algorithm, false, [usage]);
    return { success: true, key };
  } catch (err) {
    return { success: false, error: { code: 'INVALID_KEY', message: errorMessage(err) } };
  }
};

const importHmacKey = (secret: string, alg: HmacAlgorithm): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: HMAC_HASH[alg] },
    false,
    ['sign', 'verify'],
  );

export const signHmac = async (
  alg: HmacAlgorithm,
  secret: string,
  data: string,
): Promise<SignResult> => {
  let key: CryptoKey;
  try {
    key = await importHmacKey(secret, alg);
  } catch (err) {
    return { success: false, error: { code: 'INVALID_KEY', message: errorMessage(err) } };
  }

  try {
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    return { success: true, signature: base64UrlEncode(signature) };
  } catch (err) {
    return { success: false, error: { code: 'SIGNING_FAILED', message: errorMessage(err) } };
  }
};

export const signRsa = async (
  alg: RsaAlgorithm,
  privateKeyPem: string,
  data: string,
): Promise<SignResult> => {
  const imported = await importPemKey(
    privateKeyPem,
    'pkcs8',
    { name: 'RSASSA-PKCS1-v1_5', hash: RSA_HASH[alg] },
    'sign',
  );
  if (!imported.success) return imported;

  try {
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      imported.key,
      new TextEncoder().encode(data),
    );
    return { success: true, signature: base64UrlEncode(signature) };
  } catch (err) {
    return { success: false, error: { code: 'SIGNING_FAILED', message: errorMessage(err) } };
  }
};

export const verifyRsa = async (
  alg: RsaAlgorithm,
  publicKeyPem: string,
  data: string,
  signature: string,
): Promise<VerifyResult> => {
  const imported = await importPemKey(
    publicKeyPem,
    'spki',
    { name: 'RSASSA-PKCS1-v1_5', hash: RSA_HASH[alg] },
    'verify',
  );
  if (!imported.success) return imported;

  try {
    const signatureBytes = new Uint8Array(base64UrlDecodeBytes(signature));
    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      imported.key,
      signatureBytes,
      new TextEncoder().encode(data),
    );
    return { success: true, valid };
  } catch (err) {
    return { success: false, error: { code: 'VERIFICATION_FAILED', message: errorMessage(err) } };
  }
};

export const signRsaPss = async (
  alg: RsaPssAlgorithm,
  privateKeyPem: string,
  data: string,
): Promise<SignResult> => {
  const imported = await importPemKey(
    privateKeyPem,
    'pkcs8',
    { name: 'RSA-PSS', hash: RSA_PSS_HASH[alg] },
    'sign',
  );
  if (!imported.success) return imported;

  try {
    const signature = await crypto.subtle.sign(
      { name: 'RSA-PSS', saltLength: RSA_PSS_SALT_LENGTH[alg] },
      imported.key,
      new TextEncoder().encode(data),
    );
    return { success: true, signature: base64UrlEncode(signature) };
  } catch (err) {
    return { success: false, error: { code: 'SIGNING_FAILED', message: errorMessage(err) } };
  }
};

export const verifyRsaPss = async (
  alg: RsaPssAlgorithm,
  publicKeyPem: string,
  data: string,
  signature: string,
): Promise<VerifyResult> => {
  const imported = await importPemKey(
    publicKeyPem,
    'spki',
    { name: 'RSA-PSS', hash: RSA_PSS_HASH[alg] },
    'verify',
  );
  if (!imported.success) return imported;

  try {
    const signatureBytes = new Uint8Array(base64UrlDecodeBytes(signature));
    const valid = await crypto.subtle.verify(
      { name: 'RSA-PSS', saltLength: RSA_PSS_SALT_LENGTH[alg] },
      imported.key,
      signatureBytes,
      new TextEncoder().encode(data),
    );
    return { success: true, valid };
  } catch (err) {
    return { success: false, error: { code: 'VERIFICATION_FAILED', message: errorMessage(err) } };
  }
};

export const signEcdsa = async (
  alg: EcdsaAlgorithm,
  privateKeyPem: string,
  data: string,
): Promise<SignResult> => {
  const imported = await importPemKey(
    privateKeyPem,
    'pkcs8',
    { name: 'ECDSA', namedCurve: ECDSA_CURVE[alg] },
    'sign',
  );
  if (!imported.success) return imported;

  try {
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: ECDSA_HASH[alg] },
      imported.key,
      new TextEncoder().encode(data),
    );
    return { success: true, signature: base64UrlEncode(signature) };
  } catch (err) {
    return { success: false, error: { code: 'SIGNING_FAILED', message: errorMessage(err) } };
  }
};

export const verifyEcdsa = async (
  alg: EcdsaAlgorithm,
  publicKeyPem: string,
  data: string,
  signature: string,
): Promise<VerifyResult> => {
  const imported = await importPemKey(
    publicKeyPem,
    'spki',
    { name: 'ECDSA', namedCurve: ECDSA_CURVE[alg] },
    'verify',
  );
  if (!imported.success) return imported;

  try {
    const signatureBytes = new Uint8Array(base64UrlDecodeBytes(signature));
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: ECDSA_HASH[alg] },
      imported.key,
      signatureBytes,
      new TextEncoder().encode(data),
    );
    return { success: true, valid };
  } catch (err) {
    return { success: false, error: { code: 'VERIFICATION_FAILED', message: errorMessage(err) } };
  }
};

export const verifyHmac = async (
  alg: HmacAlgorithm,
  secret: string,
  data: string,
  signature: string,
): Promise<VerifyResult> => {
  let key: CryptoKey;
  try {
    key = await importHmacKey(secret, alg);
  } catch (err) {
    return { success: false, error: { code: 'INVALID_KEY', message: errorMessage(err) } };
  }

  try {
    const signatureBytes = new Uint8Array(base64UrlDecodeBytes(signature));
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      new TextEncoder().encode(data),
    );
    return { success: true, valid };
  } catch (err) {
    return { success: false, error: { code: 'VERIFICATION_FAILED', message: errorMessage(err) } };
  }
};

const signWithAlgorithm = (alg: JwtAlgorithm, key: string, data: string): Promise<SignResult> => {
  switch (alg) {
    case 'HS256':
    case 'HS384':
    case 'HS512':
      return signHmac(alg, key, data);
    case 'RS256':
    case 'RS384':
    case 'RS512':
      return signRsa(alg, key, data);
    case 'PS256':
    case 'PS384':
    case 'PS512':
      return signRsaPss(alg, key, data);
    case 'ES256':
    case 'ES384':
    case 'ES512':
      return signEcdsa(alg, key, data);
  }
};

const verifyWithAlgorithm = (
  alg: JwtAlgorithm,
  key: string,
  data: string,
  signature: string,
): Promise<VerifyResult> => {
  switch (alg) {
    case 'HS256':
    case 'HS384':
    case 'HS512':
      return verifyHmac(alg, key, data, signature);
    case 'RS256':
    case 'RS384':
    case 'RS512':
      return verifyRsa(alg, key, data, signature);
    case 'PS256':
    case 'PS384':
    case 'PS512':
      return verifyRsaPss(alg, key, data, signature);
    case 'ES256':
    case 'ES384':
    case 'ES512':
      return verifyEcdsa(alg, key, data, signature);
  }
};

export type BuildJwtResult =
  { success: true; token: string } | { success: false; error: SigningError };

/**
 * Encodes header/payload and signs them with `key`, interpreted as a shared
 * secret for HS* algorithms or a PEM private key for RS*, PS* or ES* algorithms.
 */
export const buildJwt = async (
  header: JwtHeader,
  payload: JwtPayload,
  alg: JwtAlgorithm,
  key: string,
): Promise<BuildJwtResult> => {
  const headerSegment = base64UrlEncodeText(JSON.stringify(header));
  const payloadSegment = base64UrlEncodeText(JSON.stringify(payload));
  const data = `${headerSegment}.${payloadSegment}`;

  const signed = await signWithAlgorithm(alg, key, data);
  if (!signed.success) return signed;

  return { success: true, token: `${data}.${signed.signature}` };
};

/**
 * Verifies `${headerSegment}.${payloadSegment}` against `signature`, with
 * `key` interpreted as a shared secret for HS* algorithms or a PEM public key
 * for RS*, PS* or ES* algorithms.
 */
export const verifyJwtSignature = (
  alg: JwtAlgorithm,
  key: string,
  headerSegment: string,
  payloadSegment: string,
  signature: string,
): Promise<VerifyResult> =>
  verifyWithAlgorithm(alg, key, `${headerSegment}.${payloadSegment}`, signature);
