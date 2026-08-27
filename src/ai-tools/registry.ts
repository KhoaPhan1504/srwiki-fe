import type { ToolDefinition, ToolListing, ToolResult } from './types';

export class ToolRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- a registry holds tools with different TInput/TOutput each; execute's contravariant TInput parameter makes any narrower type unsound here, so type erasure via `any` is required to store them in one Map.
  private tools = new Map<string, ToolDefinition<any, any>>();

  register<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool "${tool.name}" is already registered.`);
    }
    this.tools.set(tool.name, tool);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see the `tools` field above.
  get(name: string): ToolDefinition<any, any> | undefined {
    return this.tools.get(name);
  }

  list(): ToolListing[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      metadata: tool.metadata,
    }));
  }

  async execute(name: string, rawInput: unknown): Promise<ToolResult<unknown>> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        error: { category: 'execution', message: `Unknown tool: "${name}".` },
      };
    }

    const parsed = tool.inputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          category: 'validation',
          message: parsed.error.issues.map((issue) => issue.message).join('; '),
        },
      };
    }

    try {
      return await tool.execute(parsed.data);
    } catch {
      return {
        success: false,
        error: { category: 'internal', message: 'Unexpected failure while processing input.' },
      };
    }
  }
}
