import { ErrorCodes } from '~root/constants';
import type { ColorConversionResult, ColorInputFormat, HslColor, RgbColor } from '~root/types';

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const RGB_FUNCTION_PATTERN = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
const RGB_BARE_PATTERN = /^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/;
const HSL_FUNCTION_PATTERN =
  /^hsl\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?)%\s*,\s*(\d{1,3}(?:\.\d+)?)%\s*\)$/i;
const HSL_BARE_PATTERN =
  /^(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?)%\s*,\s*(\d{1,3}(?:\.\d+)?)%$/;

const emptyInputError = (): ColorConversionResult => ({
  success: false,
  error: { code: ErrorCodes.EMPTY_INPUT, message: '' },
});

const formatError = (code: ErrorCodes): ColorConversionResult => ({
  success: false,
  error: { code, message: '' },
});

const successResult = (format: ColorInputFormat, rgb: RgbColor): ColorConversionResult => ({
  success: true,
  color: {
    format,
    rgb,
    hex: rgbToHex(rgb),
    rgbString: formatRgbString(rgb),
    hslString: formatHslString(rgbToHsl(rgb)),
  },
});

export const hexToRgb = (hex: string): RgbColor | null => {
  const match = HEX_PATTERN.exec(hex.trim());
  if (!match) return null;

  const digits = match[1];
  const expanded =
    digits.length === 3
      ? digits
          .split('')
          .map((char) => char + char)
          .join('')
      : digits;

  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
};

export const rgbToHex = (rgb: RgbColor): string => {
  const toHexPart = (value: number) => Math.round(value).toString(16).padStart(2, '0');
  return `#${toHexPart(rgb.r)}${toHexPart(rgb.g)}${toHexPart(rgb.b)}`;
};

export const parseRgbString = (input: string): RgbColor | null => {
  const trimmed = input.trim();
  const match = RGB_FUNCTION_PATTERN.exec(trimmed) ?? RGB_BARE_PATTERN.exec(trimmed);
  if (!match) return null;

  const [r, g, b] = [match[1], match[2], match[3]].map(Number);
  if ([r, g, b].some((channel) => channel > 255)) return null;

  return { r, g, b };
};

export const formatRgbString = (rgb: RgbColor): string => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

export const rgbToHsl = (rgb: RgbColor): HslColor => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) return { h: 0, s: 0, l: Math.round(l * 100) };

  const s = delta / (1 - Math.abs(2 * l - 1));

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / delta) % 6;
      break;
    case g:
      h = (b - r) / delta + 2;
      break;
    default:
      h = (r - g) / delta + 4;
  }
  h *= 60;
  if (h < 0) h += 360;

  return { h: Math.round(h) % 360, s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const hslToRgb = (hsl: HslColor): RgbColor => {
  const h = ((hsl.h % 360) + 360) % 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rPrime: number;
  let gPrime: number;
  let bPrime: number;

  if (h < 60) [rPrime, gPrime, bPrime] = [c, x, 0];
  else if (h < 120) [rPrime, gPrime, bPrime] = [x, c, 0];
  else if (h < 180) [rPrime, gPrime, bPrime] = [0, c, x];
  else if (h < 240) [rPrime, gPrime, bPrime] = [0, x, c];
  else if (h < 300) [rPrime, gPrime, bPrime] = [x, 0, c];
  else [rPrime, gPrime, bPrime] = [c, 0, x];

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  };
};

export const parseHslString = (input: string): RgbColor | null => {
  const trimmed = input.trim();
  const match = HSL_FUNCTION_PATTERN.exec(trimmed) ?? HSL_BARE_PATTERN.exec(trimmed);
  if (!match) return null;

  const [h, s, l] = [match[1], match[2], match[3]].map(Number);
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;

  return hslToRgb({ h, s, l });
};

export const formatHslString = (hsl: HslColor): string => `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

export const parseColor = (input: string): ColorConversionResult => {
  const trimmed = input.trim();
  if (!trimmed) return emptyInputError();

  if (trimmed.startsWith('#')) {
    const rgb = hexToRgb(trimmed);
    return rgb ? successResult('hex', rgb) : formatError(ErrorCodes.INVALID_HEX);
  }

  const looksLikeHsl = /^hsl\(/i.test(trimmed) || trimmed.includes('%');
  if (looksLikeHsl) {
    const rgb = parseHslString(trimmed);
    return rgb ? successResult('hsl', rgb) : formatError(ErrorCodes.INVALID_HSL);
  }

  const looksLikeRgb = /^rgb\(/i.test(trimmed) || /^\d/.test(trimmed);
  if (looksLikeRgb) {
    const rgb = parseRgbString(trimmed);
    return rgb ? successResult('rgb', rgb) : formatError(ErrorCodes.INVALID_RGB);
  }

  return formatError(ErrorCodes.INVALID_COLOR_FORMAT);
};
