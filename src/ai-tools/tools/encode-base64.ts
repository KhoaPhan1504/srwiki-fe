import { z } from 'zod';
import { encodeBase64 } from '~root/utils/base64-encoder-decoder';
import type { ToolDefinition } from '../types';

const inputSchema = z.object({ text: z.string() });

type EncodeBase64Input = z.infer<typeof inputSchema>;
type EncodeBase64Output = { encoded: string };

export const encodeBase64Tool: ToolDefinition<EncodeBase64Input, EncodeBase64Output> = {
  name: 'encode_base64',
  description: 'Encode UTF-8 text as a base64 string.',
  inputSchema,
  metadata: { category: 'encoding', readOnly: true, requiresNetwork: false },
  execute: ({ text }) => {
    const result = encodeBase64(text);
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
    return { success: true, data: { encoded: result.output } };
  },
};
