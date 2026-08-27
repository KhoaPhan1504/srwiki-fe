import { z } from 'zod';
import { parseColor } from '~root/utils/color-converter';
import type { ToolDefinition } from '../types';

const inputSchema = z.object({ color: z.string() });

type ConvertColorInput = z.infer<typeof inputSchema>;
type ConvertColorOutput = {
  format: 'hex' | 'rgb' | 'hsl';
  rgb: { r: number; g: number; b: number };
  hex: string;
  rgbString: string;
  hslString: string;
};

export const convertColorTool: ToolDefinition<ConvertColorInput, ConvertColorOutput> = {
  name: 'convert_color',
  description:
    'Parse a color in hex (#rrggbb), rgb(), or hsl() format and return it in all three representations.',
  inputSchema,
  metadata: { category: 'conversion', readOnly: true, requiresNetwork: false },
  execute: ({ color }) => {
    const result = parseColor(color);
    if (!result.success) {
      return {
        success: false,
        error: {
          category: 'validation',
          message: result.error.message || result.error.code,
          code: result.error.code,
        },
      };
    }
    return {
      success: true,
      data: {
        format: result.color.format,
        rgb: result.color.rgb,
        hex: result.color.hex,
        rgbString: result.color.rgbString,
        hslString: result.color.hslString,
      },
    };
  },
};
