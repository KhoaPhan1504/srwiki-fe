import { describe, expect, it } from 'vitest';
import { convertData, convertLength, convertTemperature, convertTime, formatUnitValue } from '.';

describe('convertTemperature', () => {
  it('converts 0C to F and K', () => {
    const result = convertTemperature('0', 'C');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.C).toBe(0);
    expect(result.values.F).toBeCloseTo(32, 10);
    expect(result.values.K).toBeCloseTo(273.15, 10);
  });

  it('crosses at -40 (C and F meet)', () => {
    const result = convertTemperature('-40', 'C');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.F).toBeCloseTo(-40, 10);
  });

  it('converts 0K (absolute zero) to C and F', () => {
    const result = convertTemperature('0', 'K');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.C).toBeCloseTo(-273.15, 10);
    expect(result.values.F).toBeCloseTo(-459.67, 10);
  });

  it('rejects a value below absolute zero in Celsius', () => {
    const result = convertTemperature('-274', 'C');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('BELOW_ABSOLUTE_ZERO');
  });

  it('rejects a value below absolute zero in Kelvin', () => {
    const result = convertTemperature('-1', 'K');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('BELOW_ABSOLUTE_ZERO');
  });

  it('rejects a value below absolute zero in Fahrenheit', () => {
    const result = convertTemperature('-460', 'F');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('BELOW_ABSOLUTE_ZERO');
  });

  it('rejects non-numeric input', () => {
    const result = convertTemperature('abc', 'C');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('INVALID_NUMBER');
  });

  it('rejects empty input', () => {
    const result = convertTemperature('', 'C');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('EMPTY_INPUT');
  });
});

describe('convertTime', () => {
  it('converts seconds to all time units', () => {
    const result = convertTime('60', 's');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.ms).toBe(60000);
    expect(result.values.min).toBe(1);
    expect(result.values.h).toBeCloseTo(60000 / 3_600_000, 10);
    expect(result.values.day).toBeCloseTo(60000 / 86_400_000, 10);
  });

  it('allows negative durations', () => {
    const result = convertTime('-5', 'min');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.s).toBe(-300);
  });

  it('converts zero', () => {
    const result = convertTime('0', 'day');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.ms).toBe(0);
  });

  it('rejects non-numeric input', () => {
    const result = convertTime('abc', 's');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('INVALID_NUMBER');
  });

  it('rejects empty input', () => {
    const result = convertTime('', 's');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('EMPTY_INPUT');
  });
});

describe('convertData', () => {
  it('converts KB to all data units using decimal (SI) factors', () => {
    const result = convertData('1', 'KB');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.B).toBe(1000);
    expect(result.values.KB).toBe(1);
    expect(result.values.MB).toBeCloseTo(0.001, 10);
  });

  it('converts zero', () => {
    const result = convertData('0', 'B');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.TB).toBe(0);
  });

  it('rejects negative values', () => {
    const result = convertData('-5', 'KB');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('NEGATIVE_NOT_ALLOWED');
  });

  it('rejects non-numeric input', () => {
    const result = convertData('abc', 'MB');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('INVALID_NUMBER');
  });

  it('rejects empty input', () => {
    const result = convertData('', 'MB');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('EMPTY_INPUT');
  });
});

describe('convertLength', () => {
  it('converts px to all length units using the default base font size', () => {
    const result = convertLength('16', 'px');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.px).toBe(16);
    expect(result.values.rem).toBe(1);
    expect(result.values.em).toBe(1);
    expect(result.values.in).toBeCloseTo(16 / 96, 10);
  });

  it('respects a custom base font size for rem/em', () => {
    const result = convertLength('2', 'rem', 20);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.px).toBe(40);
    expect(result.values.em).toBe(2);
  });

  it('round-trips 1 inch through the CSS reference pixel (96px = 1in)', () => {
    const result = convertLength('1', 'in');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.px).toBe(96);
    expect(result.values.cm).toBeCloseTo(2.54, 10);
    expect(result.values.mm).toBeCloseTo(25.4, 10);
    expect(result.values.pt).toBeCloseTo(72, 10);
  });

  it('allows negative length values', () => {
    const result = convertLength('-10', 'px');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.px).toBe(-10);
  });

  it('converts zero', () => {
    const result = convertLength('0', 'px');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.values.in).toBe(0);
  });

  it('rejects a base font size of zero', () => {
    const result = convertLength('16', 'rem', 0);
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('INVALID_NUMBER');
  });

  it('rejects non-numeric input', () => {
    const result = convertLength('abc', 'px');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('INVALID_NUMBER');
  });

  it('rejects Infinity', () => {
    const result = convertLength('Infinity', 'px');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('INVALID_NUMBER');
  });

  it('rejects empty input', () => {
    const result = convertLength('', 'px');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('expected failure');
    expect(result.error.code).toBe('EMPTY_INPUT');
  });
});

describe('formatUnitValue', () => {
  it('formats an integer without decimal places', () => {
    expect(formatUnitValue(12)).toBe('12');
  });

  it('rounds to 6 decimal places', () => {
    expect(formatUnitValue(1 / 3)).toBe('0.333333');
  });

  it('strips trailing zeros', () => {
    expect(formatUnitValue(0.5)).toBe('0.5');
  });

  it('formats negative values', () => {
    expect(formatUnitValue(-12.5)).toBe('-12.5');
  });

  it('formats zero as "0"', () => {
    expect(formatUnitValue(0)).toBe('0');
  });

  it('formats a value that rounds to zero as "0", not "-0"', () => {
    expect(formatUnitValue(-0.0000001)).toBe('0');
  });
});
