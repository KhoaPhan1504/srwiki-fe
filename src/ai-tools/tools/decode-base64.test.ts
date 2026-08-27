import { describe, expect, it } from 'vitest';
import { toolRegistry } from '~root/ai-tools';

describe('decode_base64 tool', () => {
  it('decodes base64 text', async () => {
    const result = await toolRegistry.execute('decode_base64', { text: 'aGVsbG8=' });

    expect(result).toEqual({ success: true, data: { decoded: 'hello' } });
  });

  it('returns a validation error for invalid base64', async () => {
    const result = await toolRegistry.execute('decode_base64', { text: '***' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
      expect(result.error.code).toBe('INVALID_BASE64');
    }
  });
});
