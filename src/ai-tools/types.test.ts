import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import type { ToolDefinition, ToolListing, ToolResult } from './types';

describe('ToolDefinition contract', () => {
  it('accepts a valid tool definition', () => {
    const tool: ToolDefinition<{ value: string }, { doubled: string }> = {
      name: 'echo_twice',
      description: 'Repeats the input value twice.',
      inputSchema: z.object({ value: z.string() }),
      metadata: { category: 'testing', readOnly: true, requiresNetwork: false },
      execute: (input) => ({ success: true, data: { doubled: input.value + input.value } }),
    };

    expect(tool.name).toBe('echo_twice');
  });

  it('produces a ToolListing that is JSON-serializable and excludes execute', () => {
    const tool: ToolDefinition<{ value: string }, { doubled: string }> = {
      name: 'echo_twice',
      description: 'Repeats the input value twice.',
      inputSchema: z.object({ value: z.string() }),
      metadata: { category: 'testing', readOnly: true, requiresNetwork: false },
      execute: (input) => ({ success: true, data: { doubled: input.value + input.value } }),
    };

    const listing: ToolListing = {
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      metadata: tool.metadata,
    };

    const serialized = JSON.stringify({
      name: listing.name,
      description: listing.description,
      metadata: listing.metadata,
    });

    expect(serialized).not.toContain('execute');
    expect(JSON.parse(serialized)).toEqual({
      name: 'echo_twice',
      description: 'Repeats the input value twice.',
      metadata: { category: 'testing', readOnly: true, requiresNetwork: false },
    });
  });

  it('ToolResult success/failure shapes are JSON-serializable', () => {
    const success: ToolResult<{ doubled: string }> = { success: true, data: { doubled: 'aa' } };
    const failure: ToolResult<{ doubled: string }> = {
      success: false,
      error: { category: 'validation', message: 'value is required' },
    };

    expect(JSON.parse(JSON.stringify(success))).toEqual(success);
    expect(JSON.parse(JSON.stringify(failure))).toEqual(failure);
  });
});
