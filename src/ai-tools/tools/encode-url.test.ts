import { describe, expect, it } from 'vitest';
import { toolRegistry } from '~root/ai-tools';

describe('encode_url tool', () => {
  it('percent-encodes text', async () => {
    const result = await toolRegistry.execute('encode_url', { text: 'a b/c' });

    expect(result).toEqual({ success: true, data: { encoded: 'a%20b%2Fc' } });
  });

  it('returns a validation error for empty text', async () => {
    const result = await toolRegistry.execute('encode_url', { text: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
    }
  });
});
