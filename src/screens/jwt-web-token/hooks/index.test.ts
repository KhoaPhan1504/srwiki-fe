import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useJwtWebTokenHooks } from './index';

const JWT_IO_SECRET = 'your-256-bit-secret';
const JWT_IO_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const RSA_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCZKJ2tcqoJu0/b
TZZDhYeu11PKAdSNuzqwOTAojn+WZo8uXdAaBr8srIoLnXH7URWjyrcC0EQ7OMnt
1zmK4Aboa+rd7jNC0CVvR1eZcV+nwKUTtKEXuzg7pFJig18Q0i+O1ti07G2HKx8T
8Ar/ecCAiGt3+2SCtm+0Dtx6vlwEp5q8QGsKlvzwXewxUSius9kM37rPMlamdxUB
rw5XLZveGkxmal2GsG/MzY+B6A3moDXr4+mlE5AR9r5TtHAqCRYgt2AzlRk6yklC
MSKpRVnBYqrtv4ehncyvOxZm8oseBVU4f2PxZL44Q58vY3Pa8rBM1r8jZrK9tH0+
vHnDxnlRAgMBAAECggEABbT3uyDMqTQrk5ZehQGSvrcTTjGnQ+i4FRzsaHZ21pnX
t/iS6oVZ1kZPloM1XhH1ZncFPruX70T8cTpV0JDscPikdcSMcG7lFjJoVzVcRRnu
jL9sSUAWplJHJ5iRkETktMPYq1Ur959ptwp4vnBA9gkfSAc8BYraurDbEk/JifrO
ByWn/S7dlXTmXQg0GWTgpqh4u2RFqfjSK1DrYqcYRcHqD/JkH/H2Zv2ALPciisrf
QUnHFAXK0EFDQ1GlbCetsuAwXNz2JjCn2qyQMifUEYxq1bcZg661XY2b8QrrbEbN
r8SMlQP8TN/nw2aD1BGi06n2rLTwwNeW1dJOpDM0CQKBgQDR3azM+v1PJ0ZFt4Np
oq3YGR1gt6OeOR9r59c9whaf37zn+tCNwoewMRk1KGrY5mQfpdbgj3BshO0zVju+
8f5scn8+lKzFrCzSP4QbIVe8X4376UVEZcBgSm6whQQi2R/Da3h1o7hXghficrL5
HIBwEsvzOnK79PLfazpPQ/wUmwKBgQC607ULauygH6IMK4odpdCI3P9tmulk9IZm
n36iSpvQgPdOADSJSKhlxaXDjVkySGutAWHpPIsmRYimZSjxL/WAhzvGhCQvKhoA
M3vgdUP5EhuCjgYwfeLDy9nelK8/42EQzCnoentpWNlFuHeIGeqBFhtTErdtehip
NbihU1uqgwKBgF2vX5yBzuKu3afxrDBT9tcpHvw1/kx7o5NAA84F/qOP9Xx5cvBV
js0Qnfgk+s2oy7l1Bt9oKP/ItzrbnAA5dyJiWntNU3NK0RdqU0bpM4lb/r4d/FX0
NlTF5XPXbWlBE/Tg3P1nALvPz2m/WjXqi0t8mJ8T0HQnfORPsdAAwV9RAoGAVj+M
EfRPvvA7kCC9h0hYSAa2SLQ+USPttAynmmaVHiGbib/ggQww6aLgDrH/Xo4+X0UH
HXSczJNHLYH/77BzRt2ng9LXHYrzK+qYopugQKjSWGgWhWZoPHmsX+wGJ5lh4y5N
noyE0rJ4w44QaJ2GPAenn6dBVOIL5nntfVSNOd8CgYAZsuT1IR0bpeacWkAMm4GR
jV78hCVi5TCtC8Ol5J5Fzm8u+7KbTGk9h8LqexO3+QO5hv20Mo9fI9ASy1GPQmcH
lp3z7PcNYZlMlVsfuw8jo4Qr+xcX1YmOcrGcq5TWC3KNmEm8cpuyC6OTvW0xdDNw
wrKDcSKTReth80gwBoOfRg==
-----END PRIVATE KEY-----`;

const RSA_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmSidrXKqCbtP202WQ4WH
rtdTygHUjbs6sDkwKI5/lmaPLl3QGga/LKyKC51x+1EVo8q3AtBEOzjJ7dc5iuAG
6Gvq3e4zQtAlb0dXmXFfp8ClE7ShF7s4O6RSYoNfENIvjtbYtOxthysfE/AK/3nA
gIhrd/tkgrZvtA7cer5cBKeavEBrCpb88F3sMVEorrPZDN+6zzJWpncVAa8OVy2b
3hpMZmpdhrBvzM2PgegN5qA16+PppROQEfa+U7RwKgkWILdgM5UZOspJQjEiqUVZ
wWKq7b+HoZ3MrzsWZvKLHgVVOH9j8WS+OEOfL2Nz2vKwTNa/I2ayvbR9Prx5w8Z5
UQIDAQAB
-----END PUBLIC KEY-----`;

const RSA_OTHER_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwBdvSQ37rB/OzBzxUD/7
FS8OG2zaGyY4sOaNjOI10sCxPgv656/kMT7NEancv0UBG6rQvFV9MwYDOTT5Dabm
cwsluwKghMg82V7MDP1/1gr6I6aZYJyzqQweozVUdUPHu/aTssU8NFmZ0gZ8h9BP
rdGZkY48GN0bb/tJZguRH75Gp6k9LQv9EOw3Nmicv/98F+c7nncVIdHy6FBm/koF
9Y91t7kDrfmcGkhRW2MGAI7YmE4j3UyH9BMMk1kcMqRCmTRtl63QMNxFbQ4Bmi89
OGWMqXchDr4L4z/VlQr7ddKefCZ2ejiTa5WZeCxCwaC0AdwQTMaxKB+uzYjlABSO
OQIDAQAB
-----END PUBLIC KEY-----`;

describe('useJwtWebTokenHooks — initial state', () => {
  it('starts with the default example header/payload and no token yet', () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    expect(result.current.token).toBe('');
    expect(JSON.parse(result.current.headerText)).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(result.current.payloadText).toBe('{}');
    expect(result.current.algorithm).toBe('HS256');
    expect(result.current.signatureStatus).toBe('unknown');
    expect(result.current.decodeError).toBeNull();
    expect(result.current.headerError).toBeNull();
    expect(result.current.payloadError).toBeNull();
    expect(result.current.signError).toBeNull();
  });
});

describe('useJwtWebTokenHooks — decoded to encoded (HMAC)', () => {
  it('signs the token when the payload changes, matching the well-known jwt.io example', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());

    act(() => result.current.setSecret(JWT_IO_SECRET));
    act(() =>
      result.current.setPayloadText('{"sub":"1234567890","name":"John Doe","iat":1516239022}'),
    );

    await waitFor(() => expect(result.current.token).toBe(JWT_IO_TOKEN));
    expect(result.current.signError).toBeNull();
  });

  it('re-signs the token when the header changes', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setSecret('secret'));
    act(() => result.current.setPayloadText('{"a":1}'));
    await waitFor(() => expect(result.current.token).not.toBe(''));
    const firstToken = result.current.token;

    act(() =>
      result.current.setHeaderText('{\n  "alg": "HS256",\n  "typ": "JWT",\n  "kid": "k1"\n}'),
    );

    await waitFor(() => expect(result.current.token).not.toBe(firstToken));
    expect(result.current.token.split('.')).toHaveLength(3);
  });

  it('re-signs when the secret changes and the signature becomes self-verified', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setPayloadText('{"a":1}'));
    act(() => result.current.setSecret('secret-a'));
    await waitFor(() => expect(result.current.token).not.toBe(''));
    const tokenA = result.current.token;

    act(() => result.current.setSecret('secret-b'));
    await waitFor(() => expect(result.current.token).not.toBe(tokenA));
    await waitFor(() => expect(result.current.signatureStatus).toBe('valid'));
  });
});

describe('useJwtWebTokenHooks — encoded to decoded', () => {
  it('decodes a pasted token into header/payload and infers the algorithm', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());

    act(() => result.current.setToken(JWT_IO_TOKEN));

    expect(JSON.parse(result.current.headerText)).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(JSON.parse(result.current.payloadText)).toEqual({
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022,
    });
    expect(result.current.algorithm).toBe('HS256');
    expect(result.current.decodeError).toBeNull();
  });

  it('re-signing with the secret that originally produced a pasted token reproduces it byte-for-byte (self-verified)', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setToken(JWT_IO_TOKEN));
    act(() => result.current.setSecret(JWT_IO_SECRET));

    await waitFor(() => expect(result.current.token).toBe(JWT_IO_TOKEN));
    await waitFor(() => expect(result.current.signatureStatus).toBe('valid'));
  });

  it('reports the signature as invalid when the token is pasted while a non-matching secret is already set', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    // Setting the secret first (before pasting) means the paste's decode+verify
    // step checks the pasted token's real signature against this secret,
    // rather than re-signing over it — see the "editing the secret always
    // re-signs" behavior covered by the test above. Waiting for that resign
    // (and its own self-verify) to settle first avoids it racing the paste's
    // own verify call through the shared stale-response guard.
    act(() => result.current.setSecret('wrong-secret'));
    await waitFor(() => expect(result.current.token.split('.')).toHaveLength(3));

    act(() => result.current.setToken(JWT_IO_TOKEN));

    await waitFor(() => expect(result.current.signatureStatus).toBe('invalid'));
  });

  it('sets a decode error for a malformed token without touching header/payload', () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    const headerBefore = result.current.headerText;
    const payloadBefore = result.current.payloadText;

    act(() => result.current.setToken('not.a-valid'));

    expect(result.current.decodeError?.code).toBe('INVALID_SEGMENT_COUNT');
    expect(result.current.headerText).toBe(headerBefore);
    expect(result.current.payloadText).toBe(payloadBefore);
  });
});

describe('useJwtWebTokenHooks — algorithm switching', () => {
  it('updates header.alg and re-signs when the algorithm changes', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setSecret('secret'));
    act(() => result.current.setPayloadText('{"a":1}'));
    await waitFor(() => expect(result.current.token).not.toBe(''));

    const tokenBeforeAlgChange = result.current.token;
    act(() => result.current.setAlgorithm('HS384'));

    expect(JSON.parse(result.current.headerText).alg).toBe('HS384');
    await waitFor(() => expect(result.current.token).not.toBe(tokenBeforeAlgChange));

    const [headerSegment] = result.current.token.split('.');
    const decodedHeader = JSON.parse(atob(headerSegment.replace(/-/g, '+').replace(/_/g, '/')));
    expect(decodedHeader.alg).toBe('HS384');
  });

  it('switches to RSA and signs with a PEM private key', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setAlgorithm('RS256'));
    act(() => result.current.setPrivateKey(RSA_PRIVATE_KEY_PEM));

    await waitFor(() => expect(result.current.token.split('.')).toHaveLength(3));
    expect(result.current.signError).toBeNull();
  });

  it('reports the RSA signature valid once the matching public key is supplied', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setAlgorithm('RS256'));
    act(() => result.current.setPrivateKey(RSA_PRIVATE_KEY_PEM));
    await waitFor(() => expect(result.current.token.split('.')).toHaveLength(3));

    act(() => result.current.setPublicKey(RSA_PUBLIC_KEY_PEM));
    await waitFor(() => expect(result.current.signatureStatus).toBe('valid'));
  });

  it('reports the RSA signature invalid for a mismatched public key', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setAlgorithm('RS256'));
    act(() => result.current.setPrivateKey(RSA_PRIVATE_KEY_PEM));
    await waitFor(() => expect(result.current.token.split('.')).toHaveLength(3));

    act(() => result.current.setPublicKey(RSA_OTHER_PUBLIC_KEY_PEM));
    await waitFor(() => expect(result.current.signatureStatus).toBe('invalid'));
  });

  it('changing the public key alone does not change the token', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setAlgorithm('RS256'));
    act(() => result.current.setPrivateKey(RSA_PRIVATE_KEY_PEM));
    await waitFor(() => expect(result.current.token.split('.')).toHaveLength(3));
    const tokenBefore = result.current.token;

    act(() => result.current.setPublicKey(RSA_PUBLIC_KEY_PEM));
    await waitFor(() => expect(result.current.signatureStatus).toBe('valid'));
    expect(result.current.token).toBe(tokenBefore);
  });

  it('settles on valid even when the private key and public key are both edited before the resign completes (regression)', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setAlgorithm('RS256'));

    // Both setters fire from the same render, before either state update has
    // flushed — this is what previously left the post-resign verify step
    // reading a stale (pre-edit) public key.
    act(() => {
      result.current.setPrivateKey(RSA_PRIVATE_KEY_PEM);
      result.current.setPublicKey(RSA_PUBLIC_KEY_PEM);
    });

    await waitFor(() => expect(result.current.token.split('.')).toHaveLength(3));
    await waitFor(() => expect(result.current.signatureStatus).toBe('valid'));
  });
});

describe('useJwtWebTokenHooks — invalid input handling', () => {
  it('sets a payload error and leaves the token unchanged for invalid JSON', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setSecret('secret'));
    act(() => result.current.setPayloadText('{"a":1}'));
    await waitFor(() => expect(result.current.token).not.toBe(''));
    const tokenBefore = result.current.token;

    act(() => result.current.setPayloadText('{"a":'));

    expect(result.current.payloadError).not.toBeNull();
    expect(result.current.token).toBe(tokenBefore);
  });

  it('clears the payload error once the JSON becomes valid again', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setPayloadText('{"a":'));
    expect(result.current.payloadError).not.toBeNull();

    act(() => result.current.setPayloadText('{"a":1}'));
    expect(result.current.payloadError).toBeNull();
  });

  it('sets a sign error (invalid key) without crashing, for RSA with a malformed PEM', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setAlgorithm('RS256'));
    act(() => result.current.setPrivateKey('not a pem'));

    await waitFor(() => expect(result.current.signError?.code).toBe('INVALID_KEY'));
  });
});

describe('useJwtWebTokenHooks — clear', () => {
  it('resets everything back to the initial defaults', async () => {
    const { result } = renderHook(() => useJwtWebTokenHooks());
    act(() => result.current.setSecret('secret'));
    act(() => result.current.setPayloadText('{"a":1}'));
    await waitFor(() => expect(result.current.token).not.toBe(''));

    act(() => result.current.handleClear());

    expect(result.current.token).toBe('');
    expect(JSON.parse(result.current.headerText)).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(result.current.payloadText).toBe('{}');
    expect(result.current.algorithm).toBe('HS256');
    expect(result.current.secret).toBe('');
    expect(result.current.privateKey).toBe('');
    expect(result.current.publicKey).toBe('');
    expect(result.current.signatureStatus).toBe('unknown');
    expect(result.current.decodeError).toBeNull();
    expect(result.current.headerError).toBeNull();
    expect(result.current.payloadError).toBeNull();
    expect(result.current.signError).toBeNull();
  });
});
