import { useEffect, useRef, useState } from 'react';
import { buildJwt, verifyJwtSignature } from '~root/screens/jwt-web-token/crypto';
import type { SigningError } from '~root/screens/jwt-web-token/crypto';
import { decodeJwt } from '~root/utils/jwt-web-token';
import type { DecodeError, JwtHeader, JwtPayload } from '~root/utils/jwt-web-token';
import type { JwtAlgorithm, SignatureStatus } from '~root/constants';
import i18n from '~root/i18n';

const DEFAULT_HEADER_TEXT = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}';
const DEFAULT_PAYLOAD_TEXT = '{}';

const JWT_ALGORITHMS: readonly JwtAlgorithm[] = [
  'HS256',
  'HS384',
  'HS512',
  'RS256',
  'RS384',
  'RS512',
  'PS256',
  'PS384',
  'PS512',
  'ES256',
  'ES384',
  'ES512',
];

const isJwtAlgorithm = (value: unknown): value is JwtAlgorithm =>
  typeof value === 'string' && (JWT_ALGORITHMS as readonly string[]).includes(value);

const isHmacAlgorithm = (alg: JwtAlgorithm): boolean => alg.startsWith('HS');

type JsonObjectParseResult =
  { success: true; data: Record<string, unknown> } | { success: false; message: string };

const parseJsonObject = (text: string): JsonObjectParseResult => {
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { success: false, message: i18n.t('common:errorMessages.expectedJsonObject') };
    }
    return { success: true, data: parsed as Record<string, unknown> };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
};

export const useJwtWebTokenHooks = () => {
  const [token, setTokenState] = useState('');
  const [headerText, setHeaderTextState] = useState(DEFAULT_HEADER_TEXT);
  const [payloadText, setPayloadTextState] = useState(DEFAULT_PAYLOAD_TEXT);
  const [algorithm, setAlgorithmState] = useState<JwtAlgorithm>('HS256');
  const [secret, setSecretState] = useState('');
  const [privateKey, setPrivateKeyState] = useState('');
  const [publicKey, setPublicKeyState] = useState('');

  const [decodeError, setDecodeError] = useState<DecodeError | null>(null);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const [signError, setSignError] = useState<SigningError | null>(null);
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('unknown');

  const signRequestId = useRef(0);
  const verifyRequestId = useRef(0);
  // Mirror the latest key material in refs so an in-flight resign's post-sign
  // verify step (below) always reads the current key, even if the user edits
  // a *different* key field while that resign is still awaiting Web Crypto —
  // the `secret`/`publicKey` state captured at resign's call time would
  // otherwise go stale before its `.then()` callback runs.
  const secretRef = useRef(secret);
  const publicKeyRef = useRef(publicKey);
  useEffect(() => {
    secretRef.current = secret;
    publicKeyRef.current = publicKey;
  }, [secret, publicKey]);

  const verifyToken = (tokenToVerify: string, alg: JwtAlgorithm, verifyKey: string) => {
    const requestId = (verifyRequestId.current += 1);
    const segments = tokenToVerify.split('.');
    if (segments.length !== 3 || !verifyKey) {
      setSignatureStatus('unknown');
      return;
    }

    const [headerSegment, payloadSegment, signature] = segments;
    verifyJwtSignature(alg, verifyKey, headerSegment, payloadSegment, signature).then((result) => {
      if (verifyRequestId.current !== requestId) return;
      setSignatureStatus(result.success && result.valid ? 'valid' : 'invalid');
    });
  };

  const resign = (header: JwtHeader, payload: JwtPayload, alg: JwtAlgorithm, signKey: string) => {
    const requestId = (signRequestId.current += 1);
    buildJwt(header, payload, alg, signKey).then((result) => {
      if (signRequestId.current !== requestId) return;
      if (result.success) {
        setSignError(null);
        setTokenState(result.token);
        // Read key material fresh (not a captured argument) — the user may
        // have edited the secret/public key while this sign was in flight.
        const verifyKey = isHmacAlgorithm(alg) ? secretRef.current : publicKeyRef.current;
        verifyToken(result.token, alg, verifyKey);
      } else {
        setSignError(result.error);
      }
    });
  };

  const currentSignKey = isHmacAlgorithm(algorithm) ? secret : privateKey;

  const setToken = (value: string) => {
    setTokenState(value);
    setSignError(null);

    const result = decodeJwt(value);
    if (!result.success) {
      setDecodeError(result.error);
      setSignatureStatus('unknown');
      return;
    }

    setDecodeError(null);
    setHeaderError(null);
    setPayloadError(null);
    setHeaderTextState(JSON.stringify(result.data.header, null, 2));
    setPayloadTextState(JSON.stringify(result.data.payload, null, 2));

    const nextAlgorithm = isJwtAlgorithm(result.data.header.alg)
      ? result.data.header.alg
      : algorithm;
    setAlgorithmState(nextAlgorithm);

    verifyToken(value, nextAlgorithm, isHmacAlgorithm(nextAlgorithm) ? secret : publicKey);
  };

  const setHeaderText = (value: string) => {
    setHeaderTextState(value);
    const header = parseJsonObject(value);
    if (!header.success) {
      setHeaderError(header.message);
      return;
    }
    setHeaderError(null);

    const payload = parseJsonObject(payloadText);
    if (!payload.success) return;

    resign(header.data, payload.data, algorithm, currentSignKey);
  };

  const setPayloadText = (value: string) => {
    setPayloadTextState(value);
    const payload = parseJsonObject(value);
    if (!payload.success) {
      setPayloadError(payload.message);
      return;
    }
    setPayloadError(null);

    const header = parseJsonObject(headerText);
    if (!header.success) return;

    resign(header.data, payload.data, algorithm, currentSignKey);
  };

  const setAlgorithm = (alg: JwtAlgorithm) => {
    setAlgorithmState(alg);

    const header = parseJsonObject(headerText);
    const nextHeader = header.success ? { ...header.data, alg } : { alg };
    setHeaderTextState(JSON.stringify(nextHeader, null, 2));
    setHeaderError(null);

    const payload = parseJsonObject(payloadText);
    if (!payload.success) return;

    resign(nextHeader, payload.data, alg, isHmacAlgorithm(alg) ? secret : privateKey);
  };

  const setSecret = (value: string) => {
    setSecretState(value);
    if (!isHmacAlgorithm(algorithm)) return;

    const header = parseJsonObject(headerText);
    const payload = parseJsonObject(payloadText);
    if (!header.success || !payload.success) return;

    resign(header.data, payload.data, algorithm, value);
  };

  const setPrivateKey = (value: string) => {
    setPrivateKeyState(value);
    if (isHmacAlgorithm(algorithm)) return;

    const header = parseJsonObject(headerText);
    const payload = parseJsonObject(payloadText);
    if (!header.success || !payload.success) return;

    resign(header.data, payload.data, algorithm, value);
  };

  const setPublicKey = (value: string) => {
    setPublicKeyState(value);
    if (isHmacAlgorithm(algorithm)) return;

    verifyToken(token, algorithm, value);
  };

  const handleClear = () => {
    signRequestId.current += 1;
    verifyRequestId.current += 1;

    setTokenState('');
    setHeaderTextState(DEFAULT_HEADER_TEXT);
    setPayloadTextState(DEFAULT_PAYLOAD_TEXT);
    setAlgorithmState('HS256');
    setSecretState('');
    setPrivateKeyState('');
    setPublicKeyState('');
    setDecodeError(null);
    setHeaderError(null);
    setPayloadError(null);
    setSignError(null);
    setSignatureStatus('unknown');
  };

  return {
    token,
    setToken,
    headerText,
    setHeaderText,
    payloadText,
    setPayloadText,
    algorithm,
    setAlgorithm,
    secret,
    setSecret,
    privateKey,
    setPrivateKey,
    publicKey,
    setPublicKey,
    decodeError,
    headerError,
    payloadError,
    signError,
    signatureStatus,
    handleClear,
  };
};
