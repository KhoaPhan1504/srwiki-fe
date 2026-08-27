import type { z } from 'zod';

export type ToolErrorCategory = 'validation' | 'execution' | 'internal';

export interface ToolError {
  category: ToolErrorCategory;
  message: string;
  code?: string;
}

export type ToolResult<TOutput> =
  { success: true; data: TOutput } | { success: false; error: ToolError };

export interface ToolMetadata {
  category: string;
  readOnly: boolean;
  requiresNetwork: boolean;
}

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: z.ZodType<TInput>;
  metadata: ToolMetadata;
  execute: (input: TInput) => ToolResult<TOutput> | Promise<ToolResult<TOutput>>;
}

export type ToolListing = Omit<ToolDefinition, 'execute'>;
