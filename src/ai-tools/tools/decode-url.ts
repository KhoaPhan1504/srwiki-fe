import { z } from 'zod';
import { decodeUrl } from '~root/utils/url-encoder-decoder';
import type { ToolDefinition } from '../types';

const inputSchema = z.object({ text: z.string() });

type DecodeUrlInput = z.infer<typeof inputSchema>;
type DecodeUrlOutput = { decoded: string };

export const decodeUrlTool: ToolDefinition<DecodeUrlInput, DecodeUrlOutput> = {
  name: 'decode_url',
  description: 'Decode a percent-encoded URL component back into text.',
  inputSchema,
  metadata: { category: 'encoding', readOnly: true, requiresNetwork: false },
  execute: ({ text }) => {
    const result = decodeUrl(text);
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
