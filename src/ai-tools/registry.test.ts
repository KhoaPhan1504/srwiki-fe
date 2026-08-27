import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ToolRegistry } from './registry';
import type { ToolDefinition } from './types';

const makeEchoTool = (): ToolDefinition<{ value: string }, { value: string }> => ({
  name: 'echo',
  description: 'Returns the input value unchanged.',
  inputSchema: z.object({ value: z.string().min(1) }),
  metadata: { category: 'testing', readOnly: true, requiresNetwork: false },
  execute: (input) => ({ success: true, data: { value: input.value } }),
});

const makeThrowingTool = (): ToolDefinition<{ value: string }, never> => ({
  name: 'throws',
  description: 'Always throws to exercise internal error normalization.',
  inputSchema: z.object({ value: z.string() }),
  metadata: { category: 'testing', readOnly: true, requiresNetwork: false },
  execute: () => {
    throw new Error('db password: hunter2');
  },
});

describe('ToolRegistry', () => {
  it('registers and looks up a tool', () => {
    const registry = new ToolRegistry();
    const tool = makeEchoTool();

    registry.register(tool);

    expect(registry.has('echo')).toBe(true);
    expect(registry.get('echo')).toBe(tool);
  });

  it('throws when registering a duplicate tool name', () => {
    const registry = new ToolRegistry();
    registry.register(makeEchoTool());

    expect(() => registry.register(makeEchoTool())).toThrow('Tool "echo" is already registered.');
  });

  it('list() returns metadata without the execute function', () => {
    const registry = new ToolRegistry();
    registry.register(makeEchoTool());

    const listing = registry.list();

    expect(listing).toHaveLength(1);
    expect(listing[0]).toMatchObject({
      name: 'echo',
      description: 'Returns the input value unchanged.',
      metadata: { category: 'testing', readOnly: true, requiresNetwork: false },
    });
    expect(listing[0]).not.toHaveProperty('execute');
  });

  it('execute() returns an execution error for an unknown tool', async () => {
    const registry = new ToolRegistry();

    const result = await registry.execute('missing', {});

    expect(result).toEqual({
      success: false,
      error: { category: 'execution', message: 'Unknown tool: "missing".' },
    });
  });

  it('execute() returns a validation error for input that fails the schema, without calling execute', async () => {
    const registry = new ToolRegistry();
    let called = false;
    registry.register({
      ...makeEchoTool(),
      execute: (input) => {
        called = true;
        return { success: true, data: { value: input.value } };
      },
    });

    const result = await registry.execute('echo', { value: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
    }
    expect(called).toBe(false);
  });

  it('execute() normalizes a thrown exception to an internal error without leaking its message', async () => {
    const registry = new ToolRegistry();
    registry.register(makeThrowingTool());

    const result = await registry.execute('throws', { value: 'x' });

    expect(result).toEqual({
      success: false,
      error: { category: 'internal', message: 'Unexpected failure while processing input.' },
    });
    expect(JSON.stringify(result)).not.toContain('hunter2');
  });

  it('execute() returns the tool result on success', async () => {
    const registry = new ToolRegistry();
    registry.register(makeEchoTool());

    const result = await registry.execute('echo', { value: 'hello' });

    expect(result).toEqual({ success: true, data: { value: 'hello' } });
  });
});
