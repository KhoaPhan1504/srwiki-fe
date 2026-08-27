import { describe, expect, it } from 'vitest';
import { toolRegistry } from '~root/ai-tools';

describe('render_markdown tool', () => {
  it('renders markdown to sanitized HTML', async () => {
    const result = await toolRegistry.execute('render_markdown', { markdown: '# Hello' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ html: expect.stringContaining('<h1>Hello</h1>') });
    }
  });

  it('strips unsafe script tags', async () => {
    const result = await toolRegistry.execute('render_markdown', {
      markdown: '<script>alert(1)</script>',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ html: expect.not.stringContaining('<script>') });
    }
  });

  it('returns an empty string for empty markdown', async () => {
    const result = await toolRegistry.execute('render_markdown', { markdown: '' });

    expect(result).toEqual({ success: true, data: { html: '' } });
  });
});
