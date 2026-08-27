import { z } from 'zod';
import { UUIDVersion } from '~root/constants';
import { generateUuid } from '~root/utils/uuid-generator';
import type { ToolDefinition } from '../types';

const inputSchema = z.object({ version: z.nativeEnum(UUIDVersion) });

type GenerateUuidInput = z.infer<typeof inputSchema>;
type GenerateUuidOutput = { uuid: string };

export const generateUuidTool: ToolDefinition<GenerateUuidInput, GenerateUuidOutput> = {
  name: 'generate_uuid',
  description: 'Generate a random UUID, either version 4 (random) or version 7 (time-ordered).',
  inputSchema,
  metadata: { category: 'generation', readOnly: true, requiresNetwork: false },
  execute: ({ version }) => ({ success: true, data: { uuid: generateUuid(version) } }),
};
