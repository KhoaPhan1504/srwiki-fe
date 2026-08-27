import { describe, expect, it } from 'vitest';
import { toolRegistry } from '~root/ai-tools';

const VALID_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.dummysignature';

describe('decode_jwt tool', () => {
  it('decodes a valid token into header, payload, claims and status', async () => {
    const result = await toolRegistry.execute('decode_jwt', { token: VALID_TOKEN });

    expect(result).toEqual({
      success: true,
      data: {
        header: { alg: 'HS256', typ: 'JWT' },
        payload: { sub: '1234567890', name: 'John Doe', iat: 1516239022 },
        claims: { sub: '1234567890', iat: 1516239022 },
        status: { state: 'no-expiration' },
      },
    });
  });

  it('returns a validation error for an empty token', async () => {
    const result = await toolRegistry.execute('decode_jwt', { token: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
    }
  });

  it('returns a validation error for a token with a malformed JSON payload', async () => {
    const malformed = 'eyJhbGciOiJIUzI1NiJ9.bm90IGpzb24.sig';

    const result = await toolRegistry.execute('decode_jwt', { token: malformed });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
      expect(result.error.code).toBe('INVALID_JSON_PAYLOAD');
    }
  });
});
