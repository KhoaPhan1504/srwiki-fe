import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ToolListing } from '../types';

export interface AnthropicToolDescriptor {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export const toAnthropicTool = (listing: ToolListing): AnthropicToolDescriptor => {
  const schema = zodToJsonSchema(listing.inputSchema) as Record<string, unknown>;
  delete schema.$schema;
  return { name: listing.name, description: listing.description, inputSchema: schema };
};

export const toAnthropicTools = (listings: ToolListing[]): AnthropicToolDescriptor[] =>
  listings.map(toAnthropicTool);
