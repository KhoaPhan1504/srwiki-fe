import DOMPurify from 'dompurify';
import { Marked } from 'marked';
import { ValidationReason } from '~root/constants';
import type { ApplyToolbarActionResult, ToolbarAction } from '~root/types';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    code({ text, lang }) {
      const language = (lang ?? '').trim().split(/\s+/)[0] || 'text';
      return `<div class="md-code-block" data-language="${escapeHtml(language)}"><pre><code>${escapeHtml(text)}</code></pre></div>`;
    },
  },
});

export const renderMarkdownToSafeHtml = (markdown: string): string => {
  if (!markdown.trim()) return '';
  const rawHtml = marked.parse(markdown, { async: false });
  return DOMPurify.sanitize(rawHtml);
};

export const MAX_MARKDOWN_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

export type MarkdownUploadFileInfo = { name: string; size: number; type: string };

export type MarkdownUploadValidation =
  | { valid: true }
  | {
      valid: false;
      reason: ValidationReason.EMPTY | ValidationReason.TOO_LARGE | ValidationReason.INVALID_TYPE;
    };

const MARKDOWN_EXTENSIONS = ['.md', '.markdown', '.txt'];

export const validateMarkdownUploadFile = (
  file: MarkdownUploadFileInfo,
): MarkdownUploadValidation => {
  const lowerName = file.name.toLowerCase();
  const isMarkdownFile =
    MARKDOWN_EXTENSIONS.some((ext) => lowerName.endsWith(ext)) || file.type === 'text/markdown';
  if (!isMarkdownFile) return { valid: false, reason: ValidationReason.INVALID_TYPE };
  if (file.size === 0) return { valid: false, reason: ValidationReason.EMPTY };
  if (file.size > MAX_MARKDOWN_UPLOAD_SIZE_BYTES)
    return { valid: false, reason: ValidationReason.TOO_LARGE };
  return { valid: true };
};

const STANDALONE_DOCUMENT_STYLES = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 860px; margin: 2rem auto; padding: 0 1.5rem; line-height: 1.6; color: #1f2328; }
  h1, h2, h3, h4, h5, h6 { font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
  pre { background: #f6f8fa; padding: 1rem; border-radius: 6px; overflow-x: auto; }
  code { background: #f6f8fa; padding: 0.15em 0.35em; border-radius: 4px; font-size: 0.9em; }
  pre code { background: none; padding: 0; }
  .md-code-block { border: 1px solid #d0d7de; border-radius: 6px; overflow: hidden; margin: 1em 0; }
  .md-code-block[data-language]::before { content: attr(data-language); display: block; padding: 0.4em 1em; background: #f0f2f4; font-size: 0.75em; text-transform: uppercase; letter-spacing: 0.04em; color: #57606a; }
  .md-code-block pre { margin: 0; border-radius: 0; }
  blockquote { border-left: 4px solid #d0d7de; margin: 1em 0; padding: 0 1em; color: #57606a; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #d0d7de; padding: 0.5em 0.75em; }
  img { max-width: 100%; }
`;

export const buildStandaloneHtmlDocument = (
  safeHtml: string,
  title: string,
): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>${STANDALONE_DOCUMENT_STYLES}</style>
</head>
<body>
${safeHtml}
</body>
</html>
`;

interface WrapConfig {
  prefix: string;
  suffix: string;
  emptyPlaceholder: string;
}

const WRAP_CONFIG: Partial<Record<ToolbarAction, WrapConfig>> = {
  bold: { prefix: '**', suffix: '**', emptyPlaceholder: 'bold text' },
  italic: { prefix: '_', suffix: '_', emptyPlaceholder: 'italic text' },
  strikethrough: { prefix: '~~', suffix: '~~', emptyPlaceholder: 'strikethrough text' },
  inlineCode: { prefix: '`', suffix: '`', emptyPlaceholder: 'code' },
  codeBlock: { prefix: '```\n', suffix: '\n```', emptyPlaceholder: 'code' },
};

interface LinkConfig {
  openPrefix: string;
  urlPlaceholder: string;
  emptyTextPlaceholder: string;
}

const LINK_CONFIG: Partial<Record<ToolbarAction, LinkConfig>> = {
  link: { openPrefix: '[', urlPlaceholder: 'url', emptyTextPlaceholder: 'link text' },
  image: { openPrefix: '![', urlPlaceholder: 'image-url', emptyTextPlaceholder: 'alt text' },
};

interface BlockLineConfig {
  marker: string;
  emptyPlaceholder: string;
}

const BLOCK_LINE_CONFIG: Partial<Record<ToolbarAction, BlockLineConfig>> = {
  heading: { marker: '## ', emptyPlaceholder: 'Heading' },
  unorderedList: { marker: '- ', emptyPlaceholder: 'list item' },
  orderedList: { marker: '1. ', emptyPlaceholder: 'list item' },
  quote: { marker: '> ', emptyPlaceholder: 'quote' },
};

const lineStartIndex = (text: string, pos: number): number => {
  const idx = text.lastIndexOf('\n', pos - 1);
  return idx === -1 ? 0 : idx + 1;
};

const lineEndIndex = (text: string, pos: number): number => {
  const idx = text.indexOf('\n', pos);
  return idx === -1 ? text.length : idx;
};

const applyWrap = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
  { prefix, suffix, emptyPlaceholder }: WrapConfig,
): ApplyToolbarActionResult => {
  if (selectionStart === selectionEnd) {
    const before = text.slice(0, selectionStart);
    const after = text.slice(selectionStart);
    const template = `${prefix}${emptyPlaceholder}${suffix}`;
    return {
      text: before + template + after,
      selectionStart: before.length + prefix.length,
      selectionEnd: before.length + prefix.length + emptyPlaceholder.length,
    };
  }

  const before = text.slice(0, selectionStart);
  const selected = text.slice(selectionStart, selectionEnd);
  const after = text.slice(selectionEnd);
  return {
    text: before + prefix + selected + suffix + after,
    selectionStart: before.length + prefix.length,
    selectionEnd: before.length + prefix.length + selected.length,
  };
};

const applyLink = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
  { openPrefix, urlPlaceholder, emptyTextPlaceholder }: LinkConfig,
): ApplyToolbarActionResult => {
  const before = text.slice(0, selectionStart);

  if (selectionStart === selectionEnd) {
    const after = text.slice(selectionStart);
    const template = `${openPrefix}${emptyTextPlaceholder}](${urlPlaceholder})`;
    return {
      text: before + template + after,
      selectionStart: before.length + openPrefix.length,
      selectionEnd: before.length + openPrefix.length + emptyTextPlaceholder.length,
    };
  }

  const selected = text.slice(selectionStart, selectionEnd);
  const after = text.slice(selectionEnd);
  const closing = `](${urlPlaceholder})`;
  const urlOffsetInClosing = 2;
  return {
    text: before + openPrefix + selected + closing + after,
    selectionStart: before.length + openPrefix.length + selected.length + urlOffsetInClosing,
    selectionEnd:
      before.length +
      openPrefix.length +
      selected.length +
      urlOffsetInClosing +
      urlPlaceholder.length,
  };
};

const applyBlockLine = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
  { marker, emptyPlaceholder }: BlockLineConfig,
): ApplyToolbarActionResult => {
  const blockStart = lineStartIndex(text, selectionStart);
  const blockEnd = lineEndIndex(text, selectionEnd);

  if (blockStart === blockEnd) {
    const template = `${marker}${emptyPlaceholder}`;
    return {
      text: text.slice(0, blockStart) + template + text.slice(blockEnd),
      selectionStart: blockStart + marker.length,
      selectionEnd: blockStart + marker.length + emptyPlaceholder.length,
    };
  }

  const block = text.slice(blockStart, blockEnd);
  const prefixedBlock = block
    .split('\n')
    .map((line) => `${marker}${line}`)
    .join('\n');

  return {
    text: text.slice(0, blockStart) + prefixedBlock + text.slice(blockEnd),
    selectionStart: blockStart,
    selectionEnd: blockStart + prefixedBlock.length,
  };
};

const applyHorizontalRule = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
): ApplyToolbarActionResult => {
  const before = text.slice(0, selectionStart);
  const after = text.slice(selectionEnd);
  const rule = '\n---\n';
  return {
    text: before + rule + after,
    selectionStart: before.length + rule.length,
    selectionEnd: before.length + rule.length,
  };
};

export const applyToolbarAction = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
  action: ToolbarAction,
): ApplyToolbarActionResult => {
  const wrapConfig = WRAP_CONFIG[action];
  if (wrapConfig) return applyWrap(text, selectionStart, selectionEnd, wrapConfig);

  const linkConfig = LINK_CONFIG[action];
  if (linkConfig) return applyLink(text, selectionStart, selectionEnd, linkConfig);

  const blockLineConfig = BLOCK_LINE_CONFIG[action];
  if (blockLineConfig) return applyBlockLine(text, selectionStart, selectionEnd, blockLineConfig);

  return applyHorizontalRule(text, selectionStart, selectionEnd);
};
