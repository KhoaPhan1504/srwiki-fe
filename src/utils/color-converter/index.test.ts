import { describe, expect, it } from 'vitest';
import {
  formatHslString,
  formatRgbString,
  hexToRgb,
  hslToRgb,
  parseColor,
  parseHslString,
  parseRgbString,
  rgbToHex,
  rgbToHsl,
} from '.';

describe('hexToRgb', () => {
  it('parses a 6-digit hex code', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses a 3-digit shorthand hex code', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('is case-insensitive', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses black and white', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('rejects a hex code missing the #', () => {
    expect(hexToRgb('ff0000')).toBeNull();
  });

  it('rejects invalid hex characters', () => {
    expect(hexToRgb('#gg0000')).toBeNull();
  });

  it('rejects an incorrect length', () => {
    expect(hexToRgb('#ff00')).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('formats as lowercase 6-digit hex', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
  });

  it('pads single-digit channel values', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
  });

  it('rounds fractional channel values', () => {
    expect(rgbToHex({ r: 254.6, g: 0, b: 0 })).toBe('#ff0000');
  });
});

describe('parseRgbString', () => {
  it('parses rgb() function syntax', () => {
    expect(parseRgbString('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses bare comma-separated syntax', () => {
    expect(parseRgbString('255, 0, 0')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('tolerates extra whitespace', () => {
    expect(parseRgbString('rgb( 0 ,  128 , 255 )')).toEqual({ r: 0, g: 128, b: 255 });
  });

  it('accepts boundary values 0 and 255', () => {
    expect(parseRgbString('0, 0, 0')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseRgbString('255, 255, 255')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('rejects a missing channel', () => {
    expect(parseRgbString('rgb(255, 0)')).toBeNull();
  });

  it('rejects non-numeric values', () => {
    expect(parseRgbString('rgb(red, 0, 0)')).toBeNull();
  });

  it('rejects values outside 0-255', () => {
    expect(parseRgbString('rgb(256, 0, 0)')).toBeNull();
  });

  it('rejects invalid syntax', () => {
    expect(parseRgbString('rgb(255 0 0)')).toBeNull();
  });
});

describe('rgbToHsl', () => {
  it('converts black', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 });
  });

  it('converts white', () => {
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 });
  });

  it('converts red', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
  });

  it('converts green', () => {
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 });
  });

  it('converts blue', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 });
  });
});

describe('hslToRgb', () => {
  it('converts black', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 0 })).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('converts white', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 100 })).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('converts red', () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('converts green', () => {
    expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('converts blue', () => {
    expect(hslToRgb({ h: 240, s: 100, l: 50 })).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('wraps a hue of 360 to the same result as 0', () => {
    expect(hslToRgb({ h: 360, s: 100, l: 50 })).toEqual(hslToRgb({ h: 0, s: 100, l: 50 }));
  });
});

describe('parseHslString', () => {
  it('parses hsl() function syntax', () => {
    expect(parseHslString('hsl(0, 100%, 50%)')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses bare comma-separated syntax', () => {
    expect(parseHslString('0, 100%, 50%')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('accepts boundary values for hue, saturation and lightness', () => {
    expect(parseHslString('360, 100%, 100%')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHslString('0, 0%, 0%')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('rejects an invalid hue', () => {
    expect(parseHslString('hsl(400, 100%, 50%)')).toBeNull();
  });

  it('rejects saturation outside the valid range', () => {
    expect(parseHslString('hsl(0, 150%, 50%)')).toBeNull();
  });

  it('rejects lightness outside the valid range', () => {
    expect(parseHslString('hsl(0, 100%, 150%)')).toBeNull();
  });

  it('rejects invalid syntax', () => {
    expect(parseHslString('hsl(0 100% 50%)')).toBeNull();
  });
});

describe('formatRgbString / formatHslString', () => {
  it('formats an rgb() string', () => {
    expect(formatRgbString({ r: 255, g: 0, b: 0 })).toBe('rgb(255, 0, 0)');
  });

  it('formats an hsl() string', () => {
    expect(formatHslString({ h: 0, s: 100, l: 50 })).toBe('hsl(0, 100%, 50%)');
  });
});

describe('parseColor', () => {
  it('returns EMPTY_INPUT for an empty string', () => {
    const result = parseColor('');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('EMPTY_INPUT');
  });

  it('returns EMPTY_INPUT for whitespace-only input', () => {
    const result = parseColor('   ');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('EMPTY_INPUT');
  });

  it('auto-detects and converts a hex input to all formats', () => {
    const result = parseColor('#ff0000');
    expect(result).toEqual({
      success: true,
      color: {
        format: 'hex',
        rgb: { r: 255, g: 0, b: 0 },
        hex: '#ff0000',
        rgbString: 'rgb(255, 0, 0)',
        hslString: 'hsl(0, 100%, 50%)',
      },
    });
  });

  it('auto-detects and converts an rgb() input to all formats', () => {
    const result = parseColor('rgb(0, 255, 0)');
    expect(result).toEqual({
      success: true,
      color: {
        format: 'rgb',
        rgb: { r: 0, g: 255, b: 0 },
        hex: '#00ff00',
        rgbString: 'rgb(0, 255, 0)',
        hslString: 'hsl(120, 100%, 50%)',
      },
    });
  });

  it('auto-detects and converts an hsl() input to all formats', () => {
    const result = parseColor('hsl(240, 100%, 50%)');
    expect(result).toEqual({
      success: true,
      color: {
        format: 'hsl',
        rgb: { r: 0, g: 0, b: 255 },
        hex: '#0000ff',
        rgbString: 'rgb(0, 0, 255)',
        hslString: 'hsl(240, 100%, 50%)',
      },
    });
  });

  it('returns INVALID_HEX for a malformed hex input', () => {
    const result = parseColor('#zzzzzz');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_HEX');
  });

  it('returns INVALID_RGB for a malformed rgb input', () => {
    const result = parseColor('rgb(999, 0, 0)');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_RGB');
  });

  it('returns INVALID_HSL for a malformed hsl input', () => {
    const result = parseColor('hsl(0, 999%, 50%)');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_HSL');
  });

  it('returns INVALID_COLOR_FORMAT for unrecognized input', () => {
    const result = parseColor('not-a-color');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_COLOR_FORMAT');
  });
});

describe('round-trip', () => {
  it('hex -> rgb -> hex is stable', () => {
    const rgb = hexToRgb('#3a7bd5');
    expect(rgb).not.toBeNull();
    expect(rgbToHex(rgb as NonNullable<typeof rgb>)).toBe('#3a7bd5');
  });

  it('rgb -> hsl -> rgb is stable for a primary color', () => {
    const rgb = { r: 0, g: 128, b: 255 };
    expect(hslToRgb(rgbToHsl(rgb))).toEqual(rgb);
  });
});
