import { useMemo, useState } from 'react';
import { useDebounce } from '~root/hooks';
import { DEBOUNCE_MS } from '~root/constants';
import { applyToolbarAction, renderMarkdownToSafeHtml } from '~root/utils';
import type {
  ApplyToolbarActionResult,
  MarkdownExample,
  MarkdownViewMode,
  ToolbarAction,
} from '~root/types';

export const useMarkdownPreview = () => {
  const [markdown, setMarkdown] = useState('');
  const [viewMode, setViewMode] = useState<MarkdownViewMode>('split');

  const debouncedMarkdown = useDebounce(markdown, DEBOUNCE_MS);
  const html = useMemo(() => renderMarkdownToSafeHtml(debouncedMarkdown), [debouncedMarkdown]);

  const handleToolbarAction = (
    action: ToolbarAction,
    selectionStart: number,
    selectionEnd: number,
  ): ApplyToolbarActionResult => {
    const result = applyToolbarAction(markdown, selectionStart, selectionEnd, action);
    setMarkdown(result.text);
    return result;
  };

  const handleFileLoaded = (content: string) => {
    setMarkdown(content);
  };

  const loadExample = (example: MarkdownExample) => {
    setMarkdown(example.content);
  };

  const handleClear = () => {
    setMarkdown('');
  };

  return {
    markdown,
    setMarkdown,
    viewMode,
    setViewMode,
    html,
    handleToolbarAction,
    handleFileLoaded,
    loadExample,
    handleClear,
  };
};
