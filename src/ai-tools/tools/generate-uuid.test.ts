import { describe, expect, it } from 'vitest';
import { toolRegistry } from '~root/ai-tools';

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('generate_uuid tool', () => {
  it('generates a v4 UUID by default input', async () => {
    const result = await toolRegistry.execute('generate_uuid', { version: 'v4' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ uuid: expect.stringMatching(UUID_V4_PATTERN) });
    }
  });

  it('generates a v7 UUID', async () => {
    const result = await toolRegistry.execute('generate_uuid', { version: 'v7' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ uuid: expect.stringMatching(UUID_V7_PATTERN) });
    }
  });

  it('returns a validation error for an unsupported version', async () => {
    const result = await toolRegistry.execute('generate_uuid', { version: 'v9' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
    }
  });
});
