import { describe, expect, it } from 'vitest';
import { toolRegistry } from '~root/ai-tools';

describe('decode_url tool', () => {
  it('decodes a percent-encoded string', async () => {
    const result = await toolRegistry.execute('decode_url', { text: 'a%20b%2Fc' });

    expect(result).toEqual({ success: true, data: { decoded: 'a b/c' } });
  });

  it('returns a validation error for a malformed percent-encoding', async () => {
    const result = await toolRegistry.execute('decode_url', { text: '%' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
      expect(result.error.code).toBe('INVALID_URI_ENCODING');
    }
  });
});
