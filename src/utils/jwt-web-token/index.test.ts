import { describe, expect, it } from 'vitest';
import {
  base64UrlDecode,
  base64UrlDecodeBytes,
  base64UrlEncode,
  base64UrlEncodeText,
  decodeJwt,
  extractClaims,
  formatPem,
  getTokenStatus,
  normalizeToken,
  numericDateToDate,
  parsePem,
  splitSegments,
} from '.';

const VALID_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.dummysignature';

const toBase64Url = (input: string): string => {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

describe('normalizeToken', () => {
  it('leaves a clean token unchanged', () => {
    expect(normalizeToken('aaa.bbb.ccc')).toBe('aaa.bbb.ccc');
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizeToken('  aaa.bbb.ccc  ')).toBe('aaa.bbb.ccc');
  });

  it('removes internal whitespace from an accidentally wrapped token', () => {
    expect(normalizeToken('aaa.bbb\n.ccc')).toBe('aaa.bbb.ccc');
  });

  it('removes whitespace the token was split across (multiline paste)', () => {
    expect(normalizeToken('aaa\nbbb\nccc')).toBe('aaabbbccc');
  });

  it('removes tabs and multiple spaces', () => {
    expect(normalizeToken('aaa.\t bbb.  ccc')).toBe('aaa.bbb.ccc');
  });

  it('returns an empty string for whitespace-only input', () => {
    expect(normalizeToken('   \n\t  ')).toBe('');
  });
});

describe('splitSegments', () => {
  it('splits a well-formed token into three segments', () => {
    expect(splitSegments('aaa.bbb.ccc')).toEqual(['aaa', 'bbb', 'ccc']);
  });

  it('reports too few segments', () => {
    expect(splitSegments('aaa.bbb')).toEqual(['aaa', 'bbb']);
  });

  it('reports too many segments', () => {
    expect(splitSegments('aaa.bbb.ccc.ddd')).toEqual(['aaa', 'bbb', 'ccc', 'ddd']);
  });

  it('returns a single segment for a token with no dots', () => {
    expect(splitSegments('aaaonly')).toEqual(['aaaonly']);
  });

  it('returns a single empty segment for an empty string', () => {
    expect(splitSegments('')).toEqual(['']);
  });
});

describe('base64UrlDecode', () => {
  it('decodes a normal JSON payload', () => {
    const json = '{"sub":"1234567890","name":"John Doe"}';
    expect(base64UrlDecode(toBase64Url(json))).toBe(json);
  });

  it('decodes content padded to a multiple of 4', () => {
    const json = '{"a":1}';
    expect(toBase64Url(json).length % 4).not.toBe(0);
    expect(base64UrlDecode(toBase64Url(json))).toBe(json);
  });

  it('decodes unicode content (Vietnamese, Japanese, emoji)', () => {
    const json = JSON.stringify({ lang: '日本語', vi: 'Xin chào', emoji: '🎉' });
    expect(base64UrlDecode(toBase64Url(json))).toBe(json);
  });

  it('decodes a segment containing the URL-safe "_" character (standard base64 "/")', () => {
    const json = '{"a":1,"b":"???","c":true}';
    const segment = 'eyJhIjoxLCJiIjoiPz8_IiwiYyI6dHJ1ZX0';
    expect(segment).toContain('_');
    expect(base64UrlDecode(segment)).toBe(json);
  });

  it('decodes a segment containing the URL-safe "-" character (standard base64 "+")', () => {
    const json = '{"a":"xx>1234"}';
    const segment = 'eyJhIjoieHg-MTIzNCJ9';
    expect(segment).toContain('-');
    expect(base64UrlDecode(segment)).toBe(json);
  });

  it('throws for a segment containing invalid base64url characters', () => {
    expect(() => base64UrlDecode('not valid base64!!!')).toThrow();
  });
});

describe('base64UrlDecodeBytes', () => {
  it('decodes to the exact raw bytes without UTF-8 text decoding', () => {
    const bytes = base64UrlDecodeBytes(base64UrlEncode(Uint8Array.from([0, 1, 2, 253, 254, 255])));
    expect(bytes).toEqual(Uint8Array.from([0, 1, 2, 253, 254, 255]));
  });

  it('preserves bytes that are not valid UTF-8 (unlike base64UrlDecode)', () => {
    const invalidUtf8 = Uint8Array.from([0xff, 0xfe, 0xfd]);
    const segment = base64UrlEncode(invalidUtf8);
    expect(base64UrlDecodeBytes(segment)).toEqual(invalidUtf8);
  });

  it('throws for invalid base64url characters', () => {
    expect(() => base64UrlDecodeBytes('not valid base64!!!')).toThrow();
  });
});

describe('decodeJwt', () => {
  it('decodes a valid JWT into header, payload and signature', () => {
    const result = decodeJwt(VALID_TOKEN);
    expect(result).toEqual({
      success: true,
      data: {
        header: { alg: 'HS256', typ: 'JWT' },
        payload: { sub: '1234567890', name: 'John Doe', iat: 1516239022 },
        signature: 'dummysignature',
        segments: {
          header: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
          payload: 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
          signature: 'dummysignature',
        },
      },
    });
  });

  it('trims and reassembles a token accidentally split across lines', () => {
    const wrapped = VALID_TOKEN.replace(/\./g, '.\n').trim();
    const result = decodeJwt(wrapped);
    expect(result.success).toBe(true);
  });

  it('returns EMPTY_TOKEN for an empty string', () => {
    expect(decodeJwt('')).toEqual({
      success: false,
      error: { code: 'EMPTY_TOKEN', message: expect.any(String) },
    });
  });

  it('returns EMPTY_TOKEN for whitespace-only input', () => {
    const result = decodeJwt('   \n\t  ');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('EMPTY_TOKEN');
  });

  it('returns INVALID_SEGMENT_COUNT for a token with only 2 segments', () => {
    const result = decodeJwt('aaa.bbb');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_SEGMENT_COUNT');
  });

  it('returns INVALID_SEGMENT_COUNT for a token with 4 segments', () => {
    const result = decodeJwt('aaa.bbb.ccc.ddd');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_SEGMENT_COUNT');
  });

  it('returns INVALID_SEGMENT_COUNT for a token with no dots at all', () => {
    const result = decodeJwt('notajwttoken');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_SEGMENT_COUNT');
  });

  it('returns INVALID_BASE64 when the header segment is not valid base64url', () => {
    const result = decodeJwt('not valid!!.eyJhIjoxfQ.sig');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_BASE64');
  });

  it('returns INVALID_JSON_HEADER when the header segment decodes to non-JSON text', () => {
    const result = decodeJwt('bm90IGpzb24.eyJhIjoxfQ.sig');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_JSON_HEADER');
  });

  it('returns INVALID_JSON_PAYLOAD when the payload segment decodes to non-JSON text', () => {
    const result = decodeJwt('eyJhbGciOiJIUzI1NiJ9.bm90IGpzb24.sig');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_JSON_PAYLOAD');
  });

  it('returns INVALID_JSON_PAYLOAD when the payload decodes to a JSON number, not an object', () => {
    const result = decodeJwt('eyJhbGciOiJIUzI1NiJ9.NDI.sig');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_JSON_PAYLOAD');
  });

  it('returns INVALID_JSON_PAYLOAD when the payload decodes to a JSON array, not an object', () => {
    const result = decodeJwt('eyJhbGciOiJIUzI1NiJ9.WzEsMiwzXQ.sig');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_JSON_PAYLOAD');
  });
});

describe('numericDateToDate', () => {
  it('converts a NumericDate (seconds since epoch) to a Date, not treating it as milliseconds', () => {
    expect(numericDateToDate(0)).toEqual(new Date(0));
    expect(numericDateToDate(1516239022)).toEqual(new Date(1516239022 * 1000));
  });
});

describe('extractClaims', () => {
  it('extracts all standard claims when present', () => {
    const payload = {
      iss: 'https://issuer.example.com',
      sub: 'user-123',
      aud: 'my-app',
      exp: 2000000000,
      nbf: 1000000000,
      iat: 1500000000,
      jti: 'unique-id-1',
    };
    expect(extractClaims(payload)).toEqual(payload);
  });

  it('supports an array audience', () => {
    const payload = { aud: ['app-a', 'app-b'] };
    expect(extractClaims(payload)).toEqual({ aud: ['app-a', 'app-b'] });
  });

  it('omits an audience that is neither a string nor a string array', () => {
    expect(extractClaims({ aud: 42 })).toEqual({});
    expect(extractClaims({ aud: [1, 2] })).toEqual({});
  });

  it('returns an empty object when no standard claims are present', () => {
    expect(extractClaims({ custom: 'value' })).toEqual({});
  });

  it('ignores claims with the wrong type', () => {
    expect(extractClaims({ exp: 'not-a-number', sub: 123 })).toEqual({});
  });

  it('extracts only the claims that are present', () => {
    expect(extractClaims({ sub: 'user-1', exp: 2000000000 })).toEqual({
      sub: 'user-1',
      exp: 2000000000,
    });
  });
});

describe('getTokenStatus', () => {
  const now = 1700000000000;

  it('reports no-expiration when there is no exp claim', () => {
    expect(getTokenStatus({}, now)).toEqual({ state: 'no-expiration' });
    expect(getTokenStatus({ sub: 'user-1' }, now)).toEqual({ state: 'no-expiration' });
  });

  it('reports active when now is before exp', () => {
    const exp = now / 1000 + 3600;
    expect(getTokenStatus({ exp }, now)).toEqual({
      state: 'active',
      expiresAt: new Date(exp * 1000),
    });
  });

  it('reports active for a token expiring soon (in a few minutes)', () => {
    const exp = now / 1000 + 120;
    const result = getTokenStatus({ exp }, now);
    expect(result.state).toBe('active');
  });

  it('reports expired when now is after exp', () => {
    const exp = now / 1000 - 3600;
    expect(getTokenStatus({ exp }, now)).toEqual({
      state: 'expired',
      expiredAt: new Date(exp * 1000),
    });
  });

  it('reports expired when now exactly equals exp (boundary)', () => {
    const exp = now / 1000;
    const result = getTokenStatus({ exp }, now);
    expect(result.state).toBe('expired');
  });

  it('reports not-yet-valid when now is before nbf, regardless of exp', () => {
    const nbf = now / 1000 + 600;
    const exp = now / 1000 + 3600;
    expect(getTokenStatus({ nbf, exp }, now)).toEqual({
      state: 'not-yet-valid',
      startsAt: new Date(nbf * 1000),
    });
  });

  it('falls through to the exp check once nbf has passed', () => {
    const nbf = now / 1000 - 600;
    const exp = now / 1000 + 3600;
    expect(getTokenStatus({ nbf, exp }, now)).toEqual({
      state: 'active',
      expiresAt: new Date(exp * 1000),
    });
  });

  it('falls through to no-expiration once nbf has passed and there is no exp', () => {
    const nbf = now / 1000 - 600;
    expect(getTokenStatus({ nbf }, now)).toEqual({ state: 'no-expiration' });
  });

  it('uses Date.now() by default when now is not provided', () => {
    const result = getTokenStatus({});
    expect(result).toEqual({ state: 'no-expiration' });
  });
});

describe('base64UrlEncode', () => {
  it('encodes bytes to base64url without padding', () => {
    const bytes = new TextEncoder().encode('{"a":1}');
    expect(base64UrlEncode(bytes)).toBe('eyJhIjoxfQ');
  });

  it('accepts a plain ArrayBuffer as well as a Uint8Array', () => {
    const bytes = new TextEncoder().encode('{"a":1}');
    expect(base64UrlEncode(bytes.buffer)).toBe(base64UrlEncode(bytes));
  });

  it('uses "-" and "_" instead of "+" and "/", with no trailing "="', () => {
    const bytes = Uint8Array.from([0xfb, 0xff, 0xbf]);
    const encoded = base64UrlEncode(bytes);
    expect(encoded).toBe('-_-_');
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
  });

  it('round-trips through base64UrlDecode', () => {
    const bytes = new TextEncoder().encode('{"lang":"日本語","emoji":"🎉"}');
    expect(base64UrlDecode(base64UrlEncode(bytes))).toBe(new TextDecoder().decode(bytes));
  });
});

describe('base64UrlEncodeText', () => {
  it('matches the known header segment for a standard JWT header', () => {
    expect(base64UrlEncodeText('{"alg":"HS256","typ":"JWT"}')).toBe(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    );
  });

  it('produces a segment containing "_" for content that needs it', () => {
    const segment = base64UrlEncodeText('{"a":1,"b":"???","c":true}');
    expect(segment).toBe('eyJhIjoxLCJiIjoiPz8_IiwiYyI6dHJ1ZX0');
  });

  it('produces a segment containing "-" for content that needs it', () => {
    const segment = base64UrlEncodeText('{"a":"xx>1234"}');
    expect(segment).toBe('eyJhIjoieHg-MTIzNCJ9');
  });

  it('round-trips unicode content through base64UrlDecode', () => {
    const text = JSON.stringify({ lang: '日本語', vi: 'Xin chào', emoji: '🎉' });
    expect(base64UrlDecode(base64UrlEncodeText(text))).toBe(text);
  });
});

describe('parsePem / formatPem', () => {
  it('round-trips arbitrary bytes through formatPem then parsePem', () => {
    const bytes = Uint8Array.from({ length: 300 }, (_, i) => i % 256);
    const pem = formatPem(bytes.buffer, 'PRIVATE KEY');
    const result = parsePem(pem);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(new Uint8Array(result.data)).toEqual(bytes);
    }
  });

  it('wraps formatPem output at 64 characters per line', () => {
    const bytes = Uint8Array.from({ length: 300 }, (_, i) => i % 256);
    const pem = formatPem(bytes.buffer, 'PUBLIC KEY');
    const bodyLines = pem.split('\n').slice(1, -1);
    expect(bodyLines.length).toBeGreaterThan(1);
    bodyLines.forEach((line) => expect(line.length).toBeLessThanOrEqual(64));
  });

  it('wraps formatPem output with the given label', () => {
    const pem = formatPem(new Uint8Array([1, 2, 3]).buffer, 'RSA PRIVATE KEY');
    expect(pem.startsWith('-----BEGIN RSA PRIVATE KEY-----\n')).toBe(true);
    expect(pem.endsWith('-----END RSA PRIVATE KEY-----')).toBe(true);
  });

  it('parses a PEM with different labels', () => {
    const bytes = new Uint8Array([10, 20, 30]);
    const pem = formatPem(bytes.buffer, 'EC PRIVATE KEY');
    const result = parsePem(pem);
    expect(result.success).toBe(true);
    if (result.success) expect(new Uint8Array(result.data)).toEqual(bytes);
  });

  it('tolerates surrounding whitespace and CRLF line endings', () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const pem = formatPem(bytes.buffer, 'PUBLIC KEY').replace(/\n/g, '\r\n');
    const result = parsePem(`  \n${pem}\n  `);
    expect(result.success).toBe(true);
    if (result.success) expect(new Uint8Array(result.data)).toEqual(bytes);
  });

  it('returns INVALID_PEM when the header/footer markers are missing', () => {
    const result = parsePem('not a pem at all');
    expect(result).toEqual({
      success: false,
      error: { code: 'INVALID_PEM', message: expect.any(String) },
    });
  });

  it('returns INVALID_PEM when the body is empty', () => {
    const result = parsePem('-----BEGIN PUBLIC KEY-----\n-----END PUBLIC KEY-----');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_PEM');
  });

  it('returns INVALID_PEM when the body is not valid base64', () => {
    const result = parsePem(
      '-----BEGIN PUBLIC KEY-----\nnot valid base64!!!\n-----END PUBLIC KEY-----',
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_PEM');
  });
});
