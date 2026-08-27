import { z } from 'zod';
import {
  convertData,
  convertLength,
  convertTemperature,
  convertTime,
} from '~root/utils/unit-converter';
import type { ToolDefinition, ToolResult } from '../types';

const inputSchema = z.discriminatedUnion('category', [
  z.object({
    category: z.literal('length'),
    value: z.string(),
    fromUnit: z.enum(['px', 'rem', 'em', 'pt', 'cm', 'mm', 'in']),
    baseFontSizePx: z.number().optional(),
  }),
  z.object({
    category: z.literal('temperature'),
    value: z.string(),
    fromUnit: z.enum(['C', 'F', 'K']),
  }),
  z.object({
    category: z.literal('time'),
    value: z.string(),
    fromUnit: z.enum(['ms', 's', 'min', 'h', 'day']),
  }),
  z.object({
    category: z.literal('data'),
    value: z.string(),
    fromUnit: z.enum(['B', 'KB', 'MB', 'GB', 'TB']),
  }),
]);

type ConvertUnitInput = z.infer<typeof inputSchema>;
type ConvertUnitOutput = { values: Record<string, number> };

const mapConversionResult = <TCategory extends string, TUnit extends string>(
  result:
    | { success: true; category: TCategory; values: Record<TUnit, number> }
    | { success: false; category: TCategory; error: { code: string; message: string } },
): ToolResult<ConvertUnitOutput> => {
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
  return { success: true, data: { values: result.values } };
};

export const convertUnitTool: ToolDefinition<ConvertUnitInput, ConvertUnitOutput> = {
  name: 'convert_unit',
  description:
    'Convert a numeric value between units of length, temperature, time, or data size. Set category to pick the unit family, and fromUnit to the source unit.',
  inputSchema,
  metadata: { category: 'conversion', readOnly: true, requiresNetwork: false },
  execute: (input) => {
    switch (input.category) {
      case 'length':
        return mapConversionResult(
          convertLength(input.value, input.fromUnit, input.baseFontSizePx),
        );
      case 'temperature':
        return mapConversionResult(convertTemperature(input.value, input.fromUnit));
      case 'time':
        return mapConversionResult(convertTime(input.value, input.fromUnit));
      case 'data':
        return mapConversionResult(convertData(input.value, input.fromUnit));
    }
  },
};
