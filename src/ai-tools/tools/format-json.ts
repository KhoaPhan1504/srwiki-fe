import { z } from 'zod';
import { formatJson } from '~root/utils/json-formatter';
import type { ToolDefinition } from '../types';

const inputSchema = z.object({
  json: z.string(),
  indent: z.union([z.literal(2), z.literal(4), z.literal('tab')]),
});

type FormatJsonInput = z.infer<typeof inputSchema>;
type FormatJsonOutput = { formatted: string };

export const formatJsonTool: ToolDefinition<FormatJsonInput, FormatJsonOutput> = {
  name: 'format_json',
  description: 'Pretty-print a JSON string with the given indentation.',
  inputSchema,
  metadata: { category: 'formatting', readOnly: true, requiresNetwork: false },
  execute: ({ json, indent }) => {
    const result = formatJson(json, indent);
    if (!result.success) {
      const location =
        result.error.line !== undefined
          ? ` (line ${result.error.line}, column ${result.error.column})`
          : '';
      return {
        success: false,
        error: {
          category: 'validation',
          message: (result.error.message || result.error.code) + location,
          code: result.error.code,
        },
      };
    }
    return { success: true, data: { formatted: result.output } };
  },
};
