import type { ErrorCodes } from '~root/constants';

export type ColorConverterError = { code: ErrorCodes; message: string };

export type RgbColor = { r: number; g: number; b: number };

export type HslColor = { h: number; s: number; l: number };

export type ColorInputFormat = 'hex' | 'rgb' | 'hsl';

export type ParsedColor = {
  format: ColorInputFormat;
  rgb: RgbColor;
  hex: string;
  rgbString: string;
  hslString: string;
};

export type ColorConversionResult =
  { success: true; color: ParsedColor } | { success: false; error: ColorConverterError };
