import { z } from 'zod';
import { encodeUrl } from '~root/utils/url-encoder-decoder';
import type { ToolDefinition } from '../types';

const inputSchema = z.object({ text: z.string() });

type EncodeUrlInput = z.infer<typeof inputSchema>;
type EncodeUrlOutput = { encoded: string };

export const encodeUrlTool: ToolDefinition<EncodeUrlInput, EncodeUrlOutput> = {
  name: 'encode_url',
  description: 'Percent-encode text for safe use in a URL component.',
  inputSchema,
  metadata: { category: 'encoding', readOnly: true, requiresNetwork: false },
  execute: ({ text }) => {
    const result = encodeUrl(text);
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
