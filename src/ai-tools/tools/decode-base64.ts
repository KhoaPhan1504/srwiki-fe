import { z } from 'zod';
import { decodeBase64 } from '~root/utils/base64-encoder-decoder';
import type { ToolDefinition } from '../types';

const inputSchema = z.object({ text: z.string() });

type DecodeBase64Input = z.infer<typeof inputSchema>;
type DecodeBase64Output = { decoded: string };

export const decodeBase64Tool: ToolDefinition<DecodeBase64Input, DecodeBase64Output> = {
  name: 'decode_base64',
  description: 'Decode a base64 string back into UTF-8 text.',
  inputSchema,
  metadata: { category: 'encoding', readOnly: true, requiresNetwork: false },
  execute: ({ text }) => {
    const result = decodeBase64(text);
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
    return { success: true, data: { decoded: result.output } };
  },
};
