import { describe, expect, it } from 'vitest';
import { toolRegistry } from '~root/ai-tools';

describe('convert_color tool', () => {
  it('converts a hex color into rgb/hsl representations', async () => {
    const result = await toolRegistry.execute('convert_color', { color: '#ff0000' });

    expect(result).toEqual({
      success: true,
      data: {
        format: 'hex',
        rgb: { r: 255, g: 0, b: 0 },
        hex: '#ff0000',
        rgbString: 'rgb(255, 0, 0)',
        hslString: 'hsl(0, 100%, 50%)',
      },
    });
  });

  it('converts an rgb() color', async () => {
    const result = await toolRegistry.execute('convert_color', { color: 'rgb(0, 0, 255)' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(expect.objectContaining({ format: 'rgb', hex: '#0000ff' }));
    }
  });

  it('returns a validation error for an unrecognized format', async () => {
    const result = await toolRegistry.execute('convert_color', { color: 'not-a-color' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
      expect(result.error.code).toBe('INVALID_COLOR_FORMAT');
    }
  });
});
