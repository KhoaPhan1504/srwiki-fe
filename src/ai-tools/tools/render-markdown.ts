import { z } from 'zod';
import { renderMarkdownToSafeHtml } from '~root/utils/markdown-preview';
import type { ToolDefinition } from '../types';

const inputSchema = z.object({ markdown: z.string() });

type RenderMarkdownInput = z.infer<typeof inputSchema>;
type RenderMarkdownOutput = { html: string };

export const renderMarkdownTool: ToolDefinition<RenderMarkdownInput, RenderMarkdownOutput> = {
  name: 'render_markdown',
  description: 'Render Markdown to sanitized HTML (scripts and unsafe markup are stripped).',
  inputSchema,
  metadata: { category: 'formatting', readOnly: true, requiresNetwork: false },
  execute: ({ markdown }) => ({
    success: true,
    data: { html: renderMarkdownToSafeHtml(markdown) },
  }),
};
