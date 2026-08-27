import { z } from 'zod';
import { decodeJwt, extractClaims, getTokenStatus } from '~root/utils/jwt-web-token';
import type { ToolDefinition } from '../types';

const inputSchema = z.object({ token: z.string().min(1, 'token must not be empty') });

type DecodeJwtInput = z.infer<typeof inputSchema>;

type DecodeJwtOutput = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  claims: ReturnType<typeof extractClaims>;
  status: ReturnType<typeof getTokenStatus>;
};

export const decodeJwtTool: ToolDefinition<DecodeJwtInput, DecodeJwtOutput> = {
  name: 'decode_jwt',
  description:
    'Decode a JWT and return its header, payload, standard claims, and expiration status. Does not verify the signature.',
  inputSchema,
  metadata: { category: 'encoding', readOnly: true, requiresNetwork: false },
  execute: ({ token }) => {
    const result = decodeJwt(token);
    if (!result.success) {
      return {
        success: false,
        error: { category: 'validation', message: result.error.message, code: result.error.code },
      };
    }
    const claims = extractClaims(result.data.payload);
    const status = getTokenStatus(claims);
    return {
      success: true,
      data: { header: result.data.header, payload: result.data.payload, claims, status },
    };
  },
};
