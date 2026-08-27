import { z } from 'zod';
import { TimestampUnit } from '~root/constants';
import { convertDateToTimestamp, convertTimestampToDate } from '~root/utils/timestamp-converter';
import type { ToolDefinition } from '../types';

const inputSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('timestampToDate'),
    input: z.string(),
    unit: z.nativeEnum(TimestampUnit),
  }),
  z.object({
    mode: z.literal('dateToTimestamp'),
    input: z.string(),
    timezone: z.enum(['UTC', 'local']),
  }),
]);

type ConvertTimestampInput = z.infer<typeof inputSchema>;
type ConvertTimestampOutput =
  { date: string; milliseconds: number } | { seconds: number; milliseconds: number };

export const convertTimestampTool: ToolDefinition<ConvertTimestampInput, ConvertTimestampOutput> = {
  name: 'convert_timestamp',
  description:
    'Convert between a Unix timestamp and a calendar date. Set mode to "timestampToDate" (with input + unit) or "dateToTimestamp" (with input + timezone).',
  inputSchema,
  metadata: { category: 'conversion', readOnly: true, requiresNetwork: false },
  execute: (input) => {
    if (input.mode === 'timestampToDate') {
      const result = convertTimestampToDate(input.input, input.unit);
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
        data: { date: result.date.toISOString(), milliseconds: result.milliseconds },
      };
    }

    const result = convertDateToTimestamp(input.input, input.timezone);
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
    return { success: true, data: { seconds: result.seconds, milliseconds: result.milliseconds } };
  },
};
