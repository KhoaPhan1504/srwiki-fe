import { ToolRegistry } from './registry';
import { registerBuiltinTools } from './tools';

export * from './types';
export { ToolRegistry } from './registry';

export const toolRegistry = new ToolRegistry();
registerBuiltinTools(toolRegistry);
