import { describe, expect, it } from 'vitest';
import { toolRegistry } from '~root/ai-tools';

describe('encode_base64 tool', () => {
  it('encodes text to base64', async () => {
    const result = await toolRegistry.execute('encode_base64', { text: 'hello' });

    expect(result).toEqual({ success: true, data: { encoded: 'aGVsbG8=' } });
  });

  it('returns a validation error for empty text', async () => {
    const result = await toolRegistry.execute('encode_base64', { text: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
    }
  });
});
