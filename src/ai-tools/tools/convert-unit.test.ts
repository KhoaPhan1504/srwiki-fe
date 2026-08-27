import { describe, expect, it } from 'vitest';
import { toolRegistry } from '~root/ai-tools';

describe('convert_unit tool', () => {
  it('converts a length value', async () => {
    const result = await toolRegistry.execute('convert_unit', {
      category: 'length',
      value: '16',
      fromUnit: 'px',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ values: expect.objectContaining({ px: 16, rem: 1 }) });
    }
  });

  it('converts a temperature value', async () => {
    const result = await toolRegistry.execute('convert_unit', {
      category: 'temperature',
      value: '0',
      fromUnit: 'C',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ values: expect.objectContaining({ C: 0, F: 32 }) });
    }
  });

  it('returns a validation error for a non-numeric value', async () => {
    const result = await toolRegistry.execute('convert_unit', {
      category: 'data',
      value: 'abc',
      fromUnit: 'B',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
      expect(result.error.code).toBe('INVALID_NUMBER');
    }
  });

  it('returns a validation error for a temperature below absolute zero', async () => {
    const result = await toolRegistry.execute('convert_unit', {
      category: 'temperature',
      value: '-300',
      fromUnit: 'C',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
      expect(result.error.code).toBe('BELOW_ABSOLUTE_ZERO');
    }
  });
});
