import { describe, expect, it } from 'vitest';
import {
  buildJwt,
  signEcdsa,
  signHmac,
  signRsa,
  signRsaPss,
  verifyEcdsa,
  verifyHmac,
  verifyJwtSignature,
  verifyRsa,
  verifyRsaPss,
} from './crypto';

const JWT_IO_DATA =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
const JWT_IO_SECRET = 'your-256-bit-secret';
const JWT_IO_HS256_SIGNATURE = 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Real 2048-bit RSA keypair generated with Node's crypto.generateKeyPairSync,
// used to cross-check signRsa/verifyRsa against an independent implementation.
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

// Computed independently with Node's crypto.createSign('RSA-SHA256') over the
// same private key and data — cross-checks Web Crypto's RSASSA-PKCS1-v1_5.
const RSA_SHA256_SIGNATURE_OF_AAA_BBB =
  'C1J14R9lX8s5CLXn_svtHCBWv3eKHtwG0-SOV9OurnYvCmIGlCXy7Kuzknin5oDr4QW9qqSSaGfHuUF-KFiwgMOvJOOH5dGU2-UH3P-J39CfSAMvVuABdQ46Z5PdlFXXNUuVQbEc8NGK6cicH3FAGJEaUMljMqsdn2t0XAaBuAoTDvLVbof38xN8be6w8reJj-QbNC7ZKffIVNfKTw7gNeQ1AawbMwIdPFboAmqFsovyPuuxxjqciA3B1bx9irJuoHjfXeg7ngbRfytg6v0fLNuJxS31iucGT_ET7ddlJ3yXYmht9C_XdP_-lCClpFy55Qxyx6EnHgAtIQ1d-73n6A';

// Computed independently with Node's crypto.sign('sha256', ..., { padding:
// RSA_PKCS1_PSS_PADDING, saltLength: 32 }) over the same key/data — cross-checks
// Web Crypto's RSA-PSS with the JOSE-mandated salt length (= hash size).
const RSA_PSS_SHA256_SIGNATURE_OF_AAA_BBB =
  'OACZdfA5sBV07I7zJzshCRmbpQHUq3lpx3eJATE907KHCD1cW8kfq2u1KWEDAmOfHUnrrF966rIh5jAOI28s6mLCz79HTW8w1E7uazueZgBHlCOYd1lIsgcmq2Ulx8p8AtzFOXZQJrZkA5-3X5g1oZKCGZf3UlJrXTH9BCvpidvwy_JaZ2OpNtr0ufgrLIZSfMkQ_ByW9FzP946JrNU9WQNg-3v49fEkn03Am7OI-MKQYGw1tDNx5TQ0DSfpCWbChTvMnewkeN8ra33R0CASPVZIiJ3riIkT_XB8wY0UabP_8KjpWhMgZSQxzx07yTnqWT4i-quTvKKngSYYcGScBw';

// Real P-256 EC keypair generated with Node's crypto.generateKeyPairSync.
const EC_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgNgTNVNfrzv4quoso
tkIO2bJdjKgOYSPLUCgq6vQ0RIqhRANCAASqtlsM0UyJLhqioRBKdkN2PefEfxKt
dgBUHmIVQp15hQZMysfsg4y9g+F8Kq4g8ZzoFJelRr+FwG6GO9rIIfXA
-----END PRIVATE KEY-----`;

const EC_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEqrZbDNFMiS4aoqEQSnZDdj3nxH8S
rXYAVB5iFUKdeYUGTMrH7IOMvYPhfCquIPGc6BSXpUa/hcBuhjvayCH1wA==
-----END PUBLIC KEY-----`;

const EC_OTHER_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAERIYGobLtib/wV61G8KQTBm+gnMza
1hJAkH5ZYTlpuDSlgexzpPPbA6PBZDYixNpQFDjU1PvvUONYDHIhfScUPQ==
-----END PUBLIC KEY-----`;

// Computed independently with Node's crypto.sign('sha256', ..., { dsaEncoding:
// 'ieee-p1363' }) — the raw r||s format JOSE/ES256 requires (Web Crypto's
// native output format), as opposed to Node's default DER encoding.
const ECDSA_SHA256_SIGNATURE_OF_AAA_BBB =
  'u8fZt-RtQ_HYT69LRDnXid4Gn4GMbKIyMfnWgg3AmauxlJ5ljp8pz4OaCBRx3R9dnLcLedx4k7ttwZ1D842dGw';

// P-384 keypair + independently-computed ES384 signature (ieee-p1363), same method.
const EC384_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIG2AgEAMBAGByqGSM49AgEGBSuBBAAiBIGeMIGbAgEBBDCiKtRVS/DuJjKio2xS
kDRBU/hw7YMdQW3VNROSGFPs5ciYzr5olHL9ceqiyCR8RTWhZANiAATEF2eZb5Jm
m2dzS4ONcKTL62Z4zYBrHY/lDTvWFs8G6GHk1mf1JyQEYDAdiFool3+sYnozbdww
dGdgAbzRJq1a9Th0qt7qJclw2trkqhsPkAaNlKkBBkJKoJzqKOnOPyE=
-----END PRIVATE KEY-----`;

const EC384_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAExBdnmW+SZptnc0uDjXCky+tmeM2Aax2P
5Q071hbPBuhh5NZn9SckBGAwHYhaKJd/rGJ6M23cMHRnYAG80SatWvU4dKre6iXJ
cNra5KobD5AGjZSpAQZCSqCc6ijpzj8h
-----END PUBLIC KEY-----`;

const ECDSA_SHA384_SIGNATURE_OF_AAA_BBB =
  '7qUQyX797kzcb_lfDW87qVVJ62BWTgqH-TyYERuOiMye-N-fOqsI69AfravpZOpS0uKUvqCvA6KiQ2cFuEhCGKL3ODlzS2hVZSp1SSkqJDNxaK7R4Z6OumE9C42PX1-x';

// P-521 keypair + independently-computed ES512 signature (ieee-p1363). ES512
// uses curve P-521 (not P-512 — no such curve exists).
const EC512_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIB5ZIGqxFVarDljXyX
LZ3waEck/VuVgxx+hXDNmjcGIu498xzMqCg4yxaKonOWzi6sOmPVExS9pDjw90JP
MApUusehgYkDgYYABADKdpMZMSMU2B4HHXYG6O/gVAU8TqoJlhIhqprQieIeGgot
rwL7OMRj9htJ62qFVMxi9kXtRKrFWIqGML/z3SAquQF30rCncX2tyY64Hh6Eyr5/
a188tCwAvr6eExBbQ7zl6LIJGtfdKJV9K6slSFF3lMoM7U/ZBUxkBlDGxYZKnEkB
sg==
-----END PRIVATE KEY-----`;

const EC512_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAynaTGTEjFNgeBx12Bujv4FQFPE6q
CZYSIaqa0IniHhoKLa8C+zjEY/YbSetqhVTMYvZF7USqxViKhjC/890gKrkBd9Kw
p3F9rcmOuB4ehMq+f2tfPLQsAL6+nhMQW0O85eiyCRrX3SiVfSurJUhRd5TKDO1P
2QVMZAZQxsWGSpxJAbI=
-----END PUBLIC KEY-----`;

const ECDSA_SHA512_SIGNATURE_OF_AAA_BBB =
  'ABza7yrQ-hTj9uTwRRk-o10PSwpe_9fxeNJkWkflRqdj6mPJzMyBeWbIJLdFhkdTtJpdXMNpW_TvYyh6C8l33IJSABR2WJWv47L_qaogNaJ0H8Qd5QGe1NDkFMu1uYns4kqmZd2xBlHQJE_Ztomp3WXu5LF87xb9yd4D0MSZuZ15QmT0';

describe('signHmac', () => {
  it('matches the well-known jwt.io HS256 signature', async () => {
    const result = await signHmac('HS256', JWT_IO_SECRET, JWT_IO_DATA);
    expect(result).toEqual({ success: true, signature: JWT_IO_HS256_SIGNATURE });
  });

  it('produces a 32-byte signature for HS256', async () => {
    const result = await signHmac('HS256', 'secret', 'data');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(base64UrlLength(result.signature)).toBe(32);
    }
  });

  it('produces a 48-byte signature for HS384', async () => {
    const result = await signHmac('HS384', 'secret', 'data');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(base64UrlLength(result.signature)).toBe(48);
    }
  });

  it('produces a 64-byte signature for HS512', async () => {
    const result = await signHmac('HS512', 'secret', 'data');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(base64UrlLength(result.signature)).toBe(64);
    }
  });

  it('produces a different signature for a different secret', async () => {
    const a = await signHmac('HS256', 'secret-a', 'data');
    const b = await signHmac('HS256', 'secret-b', 'data');
    expect(a.success && b.success).toBe(true);
    if (a.success && b.success) {
      expect(a.signature).not.toBe(b.signature);
    }
  });

  it('produces a different signature for different data', async () => {
    const a = await signHmac('HS256', 'secret', 'data-a');
    const b = await signHmac('HS256', 'secret', 'data-b');
    expect(a.success && b.success).toBe(true);
    if (a.success && b.success) {
      expect(a.signature).not.toBe(b.signature);
    }
  });

  it('is deterministic for the same inputs', async () => {
    const a = await signHmac('HS256', 'secret', 'data');
    const b = await signHmac('HS256', 'secret', 'data');
    expect(a).toEqual(b);
  });
});

describe('verifyHmac', () => {
  it('verifies a signature produced by signHmac with the same secret', async () => {
    const signed = await signHmac('HS256', 'secret', 'aaa.bbb');
    expect(signed.success).toBe(true);
    if (!signed.success) return;

    const verified = await verifyHmac('HS256', 'secret', 'aaa.bbb', signed.signature);
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('verifies the well-known jwt.io HS256 example', async () => {
    const verified = await verifyHmac('HS256', JWT_IO_SECRET, JWT_IO_DATA, JWT_IO_HS256_SIGNATURE);
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('reports invalid when the secret is wrong', async () => {
    const signed = await signHmac('HS256', 'right-secret', 'aaa.bbb');
    expect(signed.success).toBe(true);
    if (!signed.success) return;

    const verified = await verifyHmac('HS256', 'wrong-secret', 'aaa.bbb', signed.signature);
    expect(verified).toEqual({ success: true, valid: false });
  });

  it('reports invalid when the data has been tampered with', async () => {
    const signed = await signHmac('HS256', 'secret', 'aaa.bbb');
    expect(signed.success).toBe(true);
    if (!signed.success) return;

    const verified = await verifyHmac('HS256', 'secret', 'aaa.tampered', signed.signature);
    expect(verified).toEqual({ success: true, valid: false });
  });

  it('reports invalid when the algorithm does not match how it was signed', async () => {
    const signed = await signHmac('HS256', 'secret', 'aaa.bbb');
    expect(signed.success).toBe(true);
    if (!signed.success) return;

    const verified = await verifyHmac('HS384', 'secret', 'aaa.bbb', signed.signature);
    expect(verified).toEqual({ success: true, valid: false });
  });

  it('returns a VERIFICATION_FAILED error for a signature that is not valid base64url', async () => {
    const verified = await verifyHmac('HS256', 'secret', 'aaa.bbb', 'not valid base64!!!');
    expect(verified.success).toBe(false);
    if (!verified.success) expect(verified.error.code).toBe('VERIFICATION_FAILED');
  });
});

describe('signRsa', () => {
  it('matches a signature computed independently by Node crypto.createSign', async () => {
    const result = await signRsa('RS256', RSA_PRIVATE_KEY_PEM, 'aaa.bbb');
    expect(result).toEqual({ success: true, signature: RSA_SHA256_SIGNATURE_OF_AAA_BBB });
  });

  it('produces a 256-byte signature for a 2048-bit key regardless of RS256/384/512', async () => {
    for (const alg of ['RS256', 'RS384', 'RS512'] as const) {
      const result = await signRsa(alg, RSA_PRIVATE_KEY_PEM, 'data');
      expect(result.success).toBe(true);
      if (result.success) expect(base64UrlLength(result.signature)).toBe(256);
    }
  });

  it('is deterministic (PKCS1v1.5 has no random salt)', async () => {
    const a = await signRsa('RS256', RSA_PRIVATE_KEY_PEM, 'data');
    const b = await signRsa('RS256', RSA_PRIVATE_KEY_PEM, 'data');
    expect(a).toEqual(b);
  });

  it('returns INVALID_KEY for a malformed PEM', async () => {
    const result = await signRsa('RS256', 'not a pem', 'data');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_KEY');
  });

  it('returns INVALID_KEY when given a public key instead of a private key', async () => {
    const result = await signRsa('RS256', RSA_PUBLIC_KEY_PEM, 'data');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_KEY');
  });
});

describe('verifyRsa', () => {
  it('verifies the known-good signature computed by Node crypto', async () => {
    const verified = await verifyRsa(
      'RS256',
      RSA_PUBLIC_KEY_PEM,
      'aaa.bbb',
      RSA_SHA256_SIGNATURE_OF_AAA_BBB,
    );
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('verifies a signature produced by signRsa with the matching public key', async () => {
    const signed = await signRsa('RS384', RSA_PRIVATE_KEY_PEM, 'aaa.bbb');
    expect(signed.success).toBe(true);
    if (!signed.success) return;

    const verified = await verifyRsa('RS384', RSA_PUBLIC_KEY_PEM, 'aaa.bbb', signed.signature);
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('reports invalid when the data has been tampered with', async () => {
    const verified = await verifyRsa(
      'RS256',
      RSA_PUBLIC_KEY_PEM,
      'aaa.tampered',
      RSA_SHA256_SIGNATURE_OF_AAA_BBB,
    );
    expect(verified).toEqual({ success: true, valid: false });
  });

  it('reports invalid when the public key does not match the signing private key', async () => {
    const verified = await verifyRsa(
      'RS256',
      RSA_OTHER_PUBLIC_KEY_PEM,
      'aaa.bbb',
      RSA_SHA256_SIGNATURE_OF_AAA_BBB,
    );
    expect(verified).toEqual({ success: true, valid: false });
  });

  it('returns INVALID_KEY for a malformed PEM', async () => {
    const result = await verifyRsa('RS256', 'not a pem', 'data', 'sig');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_KEY');
  });

  it('returns INVALID_KEY when given a private key instead of a public key', async () => {
    const result = await verifyRsa('RS256', RSA_PRIVATE_KEY_PEM, 'data', 'sig');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_KEY');
  });
});

describe('signRsaPss', () => {
  it('verifies against the known-good signature computed independently by Node crypto', async () => {
    const verified = await verifyRsaPss(
      'PS256',
      RSA_PUBLIC_KEY_PEM,
      'aaa.bbb',
      RSA_PSS_SHA256_SIGNATURE_OF_AAA_BBB,
    );
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('produces a 256-byte signature for a 2048-bit key regardless of PS256/384/512', async () => {
    for (const alg of ['PS256', 'PS384', 'PS512'] as const) {
      const result = await signRsaPss(alg, RSA_PRIVATE_KEY_PEM, 'data');
      expect(result.success).toBe(true);
      if (result.success) expect(base64UrlLength(result.signature)).toBe(256);
    }
  });

  it('is randomized — two signatures over the same input differ (unlike PKCS1v1.5)', async () => {
    const a = await signRsaPss('PS256', RSA_PRIVATE_KEY_PEM, 'data');
    const b = await signRsaPss('PS256', RSA_PRIVATE_KEY_PEM, 'data');
    expect(a.success && b.success).toBe(true);
    if (a.success && b.success) {
      expect(a.signature).not.toBe(b.signature);
    }
  });

  it('returns INVALID_KEY for a malformed PEM', async () => {
    const result = await signRsaPss('PS256', 'not a pem', 'data');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_KEY');
  });
});

describe('verifyRsaPss', () => {
  it('verifies a self-produced signature with the matching public key', async () => {
    const signed = await signRsaPss('PS256', RSA_PRIVATE_KEY_PEM, 'aaa.bbb');
    expect(signed.success).toBe(true);
    if (!signed.success) return;

    const verified = await verifyRsaPss('PS256', RSA_PUBLIC_KEY_PEM, 'aaa.bbb', signed.signature);
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('reports invalid when the data has been tampered with', async () => {
    const verified = await verifyRsaPss(
      'PS256',
      RSA_PUBLIC_KEY_PEM,
      'aaa.tampered',
      RSA_PSS_SHA256_SIGNATURE_OF_AAA_BBB,
    );
    expect(verified).toEqual({ success: true, valid: false });
  });

  it('reports invalid when the public key does not match the signing private key', async () => {
    const verified = await verifyRsaPss(
      'PS256',
      RSA_OTHER_PUBLIC_KEY_PEM,
      'aaa.bbb',
      RSA_PSS_SHA256_SIGNATURE_OF_AAA_BBB,
    );
    expect(verified).toEqual({ success: true, valid: false });
  });

  it('reports invalid for a signature produced with the wrong salt length (PS384 vs PS256)', async () => {
    const signed = await signRsaPss('PS384', RSA_PRIVATE_KEY_PEM, 'aaa.bbb');
    expect(signed.success).toBe(true);
    if (!signed.success) return;

    const verified = await verifyRsaPss('PS256', RSA_PUBLIC_KEY_PEM, 'aaa.bbb', signed.signature);
    expect(verified).toEqual({ success: true, valid: false });
  });

  it('returns INVALID_KEY for a malformed PEM', async () => {
    const result = await verifyRsaPss('PS256', 'not a pem', 'data', 'sig');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_KEY');
  });
});

describe('signEcdsa', () => {
  it('verifies against the known-good ES256 signature computed independently by Node crypto', async () => {
    const verified = await verifyEcdsa(
      'ES256',
      EC_PUBLIC_KEY_PEM,
      'aaa.bbb',
      ECDSA_SHA256_SIGNATURE_OF_AAA_BBB,
    );
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('verifies against the known-good ES384 signature computed independently by Node crypto', async () => {
    const verified = await verifyEcdsa(
      'ES384',
      EC384_PUBLIC_KEY_PEM,
      'aaa.bbb',
      ECDSA_SHA384_SIGNATURE_OF_AAA_BBB,
    );
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('verifies against the known-good ES512 signature computed independently by Node crypto (curve P-521)', async () => {
    const verified = await verifyEcdsa(
      'ES512',
      EC512_PUBLIC_KEY_PEM,
      'aaa.bbb',
      ECDSA_SHA512_SIGNATURE_OF_AAA_BBB,
    );
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('produces a 64-byte raw r||s signature for ES256 (P-256: 32+32)', async () => {
    const result = await signEcdsa('ES256', EC_PRIVATE_KEY_PEM, 'data');
    expect(result.success).toBe(true);
    if (result.success) expect(base64UrlLength(result.signature)).toBe(64);
  });

  it('produces a 96-byte raw r||s signature for ES384 (P-384: 48+48)', async () => {
    const result = await signEcdsa('ES384', EC384_PRIVATE_KEY_PEM, 'data');
    expect(result.success).toBe(true);
    if (result.success) expect(base64UrlLength(result.signature)).toBe(96);
  });

  it('produces a 132-byte raw r||s signature for ES512 (P-521: 66+66)', async () => {
    const result = await signEcdsa('ES512', EC512_PRIVATE_KEY_PEM, 'data');
    expect(result.success).toBe(true);
    if (result.success) expect(base64UrlLength(result.signature)).toBe(132);
  });

  it('is randomized — two signatures over the same input differ (ECDSA uses a random nonce)', async () => {
    const a = await signEcdsa('ES256', EC_PRIVATE_KEY_PEM, 'data');
    const b = await signEcdsa('ES256', EC_PRIVATE_KEY_PEM, 'data');
    expect(a.success && b.success).toBe(true);
    if (a.success && b.success) {
      expect(a.signature).not.toBe(b.signature);
    }
  });

  it('returns INVALID_KEY for a malformed PEM', async () => {
    const result = await signEcdsa('ES256', 'not a pem', 'data');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_KEY');
  });

  it('returns INVALID_KEY when the PEM curve does not match the algorithm (ES384 key for ES256)', async () => {
    const result = await signEcdsa('ES256', EC384_PRIVATE_KEY_PEM, 'data');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_KEY');
  });
});

describe('verifyEcdsa', () => {
  it('verifies a self-produced signature with the matching public key', async () => {
    const signed = await signEcdsa('ES256', EC_PRIVATE_KEY_PEM, 'aaa.bbb');
    expect(signed.success).toBe(true);
    if (!signed.success) return;

    const verified = await verifyEcdsa('ES256', EC_PUBLIC_KEY_PEM, 'aaa.bbb', signed.signature);
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('reports invalid when the data has been tampered with', async () => {
    const verified = await verifyEcdsa(
      'ES256',
      EC_PUBLIC_KEY_PEM,
      'aaa.tampered',
      ECDSA_SHA256_SIGNATURE_OF_AAA_BBB,
    );
    expect(verified).toEqual({ success: true, valid: false });
  });

  it('reports invalid when the public key does not match the signing private key', async () => {
    const verified = await verifyEcdsa(
      'ES256',
      EC_OTHER_PUBLIC_KEY_PEM,
      'aaa.bbb',
      ECDSA_SHA256_SIGNATURE_OF_AAA_BBB,
    );
    expect(verified).toEqual({ success: true, valid: false });
  });

  it('returns INVALID_KEY for a malformed PEM', async () => {
    const result = await verifyEcdsa('ES256', 'not a pem', 'data', 'sig');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_KEY');
  });

  it('returns INVALID_KEY when the PEM curve does not match the algorithm (ES384 key for ES256)', async () => {
    const result = await verifyEcdsa('ES256', EC384_PUBLIC_KEY_PEM, 'data', 'sig');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_KEY');
  });
});

describe('buildJwt', () => {
  it('produces a 3-segment token matching the well-known jwt.io HS256 example', async () => {
    const result = await buildJwt(
      { alg: 'HS256', typ: 'JWT' },
      { sub: '1234567890', name: 'John Doe', iat: 1516239022 },
      'HS256',
      JWT_IO_SECRET,
    );
    expect(result).toEqual({
      success: true,
      token: `${JWT_IO_DATA}.${JWT_IO_HS256_SIGNATURE}`,
    });
  });

  it('round-trips through verifyJwtSignature for HS256', async () => {
    const built = await buildJwt({ alg: 'HS256', typ: 'JWT' }, { a: 1 }, 'HS256', 'secret');
    expect(built.success).toBe(true);
    if (!built.success) return;

    const [headerSegment, payloadSegment, signature] = built.token.split('.');
    const verified = await verifyJwtSignature(
      'HS256',
      'secret',
      headerSegment,
      payloadSegment,
      signature,
    );
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('round-trips through verifyJwtSignature for RS256', async () => {
    const built = await buildJwt(
      { alg: 'RS256', typ: 'JWT' },
      { a: 1 },
      'RS256',
      RSA_PRIVATE_KEY_PEM,
    );
    expect(built.success).toBe(true);
    if (!built.success) return;

    const [headerSegment, payloadSegment, signature] = built.token.split('.');
    const verified = await verifyJwtSignature(
      'RS256',
      RSA_PUBLIC_KEY_PEM,
      headerSegment,
      payloadSegment,
      signature,
    );
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('round-trips through verifyJwtSignature for PS256', async () => {
    const built = await buildJwt(
      { alg: 'PS256', typ: 'JWT' },
      { a: 1 },
      'PS256',
      RSA_PRIVATE_KEY_PEM,
    );
    expect(built.success).toBe(true);
    if (!built.success) return;

    const [headerSegment, payloadSegment, signature] = built.token.split('.');
    const verified = await verifyJwtSignature(
      'PS256',
      RSA_PUBLIC_KEY_PEM,
      headerSegment,
      payloadSegment,
      signature,
    );
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('round-trips through verifyJwtSignature for ES256', async () => {
    const built = await buildJwt(
      { alg: 'ES256', typ: 'JWT' },
      { a: 1 },
      'ES256',
      EC_PRIVATE_KEY_PEM,
    );
    expect(built.success).toBe(true);
    if (!built.success) return;

    const [headerSegment, payloadSegment, signature] = built.token.split('.');
    const verified = await verifyJwtSignature(
      'ES256',
      EC_PUBLIC_KEY_PEM,
      headerSegment,
      payloadSegment,
      signature,
    );
    expect(verified).toEqual({ success: true, valid: true });
  });

  it('encodes nested payload values correctly', async () => {
    const built = await buildJwt(
      { alg: 'HS256', typ: 'JWT' },
      { nested: { a: [1, 2, 3], b: null, c: true } },
      'HS256',
      'secret',
    );
    expect(built.success).toBe(true);
    if (!built.success) return;

    const [headerSegment, payloadSegment] = built.token.split('.');
    expect(JSON.parse(atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/')))).toEqual({
      nested: { a: [1, 2, 3], b: null, c: true },
    });
    expect(headerSegment).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
  });

  it('propagates a signing error (e.g. invalid key) instead of throwing', async () => {
    const result = await buildJwt({ alg: 'RS256' }, { a: 1 }, 'RS256', 'not a pem');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_KEY');
  });
});

describe('verifyJwtSignature', () => {
  it('reports invalid for a tampered payload segment', async () => {
    const built = await buildJwt({ alg: 'HS256', typ: 'JWT' }, { a: 1 }, 'HS256', 'secret');
    expect(built.success).toBe(true);
    if (!built.success) return;

    const [headerSegment, , signature] = built.token.split('.');
    const verified = await verifyJwtSignature(
      'HS256',
      'secret',
      headerSegment,
      'dGFtcGVyZWQ',
      signature,
    );
    expect(verified).toEqual({ success: true, valid: false });
  });
});

function base64UrlLength(segment: string): number {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(padded).length;
}
