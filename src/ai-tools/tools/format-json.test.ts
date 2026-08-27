import { describe, expect, it } from 'vitest';
import { toolRegistry } from '~root/ai-tools';

describe('format_json tool', () => {
  it('formats JSON with the given indent', async () => {
    const result = await toolRegistry.execute('format_json', { json: '{"a":1}', indent: 2 });

    expect(result).toEqual({ success: true, data: { formatted: '{\n  "a": 1\n}' } });
  });

  it('formats JSON with tab indent', async () => {
    const result = await toolRegistry.execute('format_json', { json: '{"a":1}', indent: 'tab' });

    expect(result).toEqual({ success: true, data: { formatted: '{\n\t"a": 1\n}' } });
  });

  it('returns a validation error with line/column info for malformed JSON', async () => {
    const result = await toolRegistry.execute('format_json', { json: '{"a":}', indent: 2 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
      expect(result.error.code).toBe('PARSE_ERROR');
      expect(result.error.message).toMatch(/line \d+, column \d+/);
    }
  });

  it('returns a validation error for empty input', async () => {
    const result = await toolRegistry.execute('format_json', { json: '', indent: 2 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
      expect(result.error.code).toBe('EMPTY_INPUT');
    }
  });
});
