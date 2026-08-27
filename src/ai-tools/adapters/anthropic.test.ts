import { describe, expect, it } from 'vitest';
import { toolRegistry } from '~root/ai-tools';
import { decodeJwtTool } from '../tools/decode-jwt';
import { convertUnitTool } from '../tools/convert-unit';
import { toAnthropicTool, toAnthropicTools } from './anthropic';

describe('toAnthropicTool', () => {
  it('converts a simple tool schema, with no $schema key', () => {
    const result = toAnthropicTool(decodeJwtTool);

    expect(result.name).toBe('decode_jwt');
    expect(result.description).toBe(decodeJwtTool.description);
    expect(result.inputSchema).not.toHaveProperty('$schema');
    expect(result.inputSchema).toMatchObject({
      type: 'object',
      properties: { token: { type: 'string' } },
      required: ['token'],
    });
  });

  it('converts a discriminated-union tool schema into anyOf branches', () => {
    const result = toAnthropicTool(convertUnitTool);

    const anyOf = result.inputSchema.anyOf as Array<{
      properties: { category: { const: string } };
    }>;
    expect(anyOf).toHaveLength(4);
    expect(anyOf.map((branch) => branch.properties.category.const).sort()).toEqual([
      'data',
      'length',
      'temperature',
      'time',
    ]);
  });
});

describe('toAnthropicTools', () => {
  it('converts every registered tool with no execute leaking through', () => {
    const results = toAnthropicTools(toolRegistry.list());

    expect(results).toHaveLength(13);
    results.forEach((tool) => {
      expect(tool).not.toHaveProperty('execute');
    });
  });
});
