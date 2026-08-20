import type { LucideIcon } from 'lucide-react';

export type MarkdownViewMode = 'editor' | 'split' | 'preview';

export type ToolbarAction =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'link'
  | 'image'
  | 'unorderedList'
  | 'orderedList'
  | 'quote'
  | 'inlineCode'
  | 'codeBlock'
  | 'horizontalRule';

export interface ToolbarActionDefinition {
  action: ToolbarAction;
  icon: LucideIcon;
  labelKey: string;
  shortcut?: string;
}

export interface ApplyToolbarActionResult {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface MarkdownExample {
  id: string;
  labelKey: string;
  content: string;
}
