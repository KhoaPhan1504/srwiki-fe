import { describe, expect, it } from 'vitest';
import {
  applyToolbarAction,
  buildStandaloneHtmlDocument,
  MAX_MARKDOWN_UPLOAD_SIZE_BYTES,
  renderMarkdownToSafeHtml,
  validateMarkdownUploadFile,
} from './index';

describe('applyToolbarAction', () => {
  describe('bold', () => {
    it('wraps a selection with ** markers and selects the inner text', () => {
      const result = applyToolbarAction('Hello world', 0, 5, 'bold');
      expect(result.text).toBe('**Hello** world');
      expect(result.selectionStart).toBe(2);
      expect(result.selectionEnd).toBe(7);
    });

    it('inserts a placeholder template when nothing is selected', () => {
      const result = applyToolbarAction('', 0, 0, 'bold');
      expect(result.text).toBe('**bold text**');
      expect(result.selectionStart).toBe(2);
      expect(result.selectionEnd).toBe(11);
    });
  });

  describe('italic', () => {
    it('wraps a selection with _ markers', () => {
      const result = applyToolbarAction('Hello world', 6, 11, 'italic');
      expect(result.text).toBe('Hello _world_');
      expect(result.selectionStart).toBe(7);
      expect(result.selectionEnd).toBe(12);
    });

    it('inserts a placeholder template when nothing is selected', () => {
      const result = applyToolbarAction('', 0, 0, 'italic');
      expect(result.text).toBe('_italic text_');
      expect(result.selectionStart).toBe(1);
      expect(result.selectionEnd).toBe(12);
    });
  });

  describe('strikethrough', () => {
    it('wraps a selection with ~~ markers', () => {
      const result = applyToolbarAction('Hello world', 0, 5, 'strikethrough');
      expect(result.text).toBe('~~Hello~~ world');
      expect(result.selectionStart).toBe(2);
      expect(result.selectionEnd).toBe(7);
    });

    it('inserts a placeholder template when nothing is selected', () => {
      const result = applyToolbarAction('', 0, 0, 'strikethrough');
      expect(result.text).toBe('~~strikethrough text~~');
      expect(result.selectionStart).toBe(2);
      expect(result.selectionEnd).toBe(20);
    });
  });

  describe('inlineCode', () => {
    it('wraps a selection with backticks', () => {
      const result = applyToolbarAction('const x = 1', 0, 5, 'inlineCode');
      expect(result.text).toBe('`const` x = 1');
      expect(result.selectionStart).toBe(1);
      expect(result.selectionEnd).toBe(6);
    });

    it('inserts a placeholder template when nothing is selected', () => {
      const result = applyToolbarAction('', 0, 0, 'inlineCode');
      expect(result.text).toBe('`code`');
      expect(result.selectionStart).toBe(1);
      expect(result.selectionEnd).toBe(5);
    });
  });

  describe('link', () => {
    it('wraps selected text as link text and selects the url placeholder', () => {
      const result = applyToolbarAction('Click here', 6, 10, 'link');
      expect(result.text).toBe('Click [here](url)');
      expect(result.selectionStart).toBe(13);
      expect(result.selectionEnd).toBe(16);
    });

    it('inserts a full template and selects the link text when nothing is selected', () => {
      const result = applyToolbarAction('', 0, 0, 'link');
      expect(result.text).toBe('[link text](url)');
      expect(result.selectionStart).toBe(1);
      expect(result.selectionEnd).toBe(10);
    });
  });

  describe('image', () => {
    it('wraps selected text as alt text and selects the image-url placeholder', () => {
      const result = applyToolbarAction('logo', 0, 4, 'image');
      expect(result.text).toBe('![logo](image-url)');
      expect(result.selectionStart).toBe(8);
      expect(result.selectionEnd).toBe(17);
    });

    it('inserts a full template and selects the alt text when nothing is selected', () => {
      const result = applyToolbarAction('', 0, 0, 'image');
      expect(result.text).toBe('![alt text](image-url)');
      expect(result.selectionStart).toBe(2);
      expect(result.selectionEnd).toBe(10);
    });
  });

  describe('codeBlock', () => {
    it('wraps a selection in a fenced code block, keeping the inner text selected', () => {
      const result = applyToolbarAction('const x = 1;', 0, 12, 'codeBlock');
      expect(result.text).toBe('```\nconst x = 1;\n```');
      expect(result.selectionStart).toBe(4);
      expect(result.selectionEnd).toBe(16);
    });

    it('inserts a placeholder template when nothing is selected', () => {
      const result = applyToolbarAction('', 0, 0, 'codeBlock');
      expect(result.text).toBe('```\ncode\n```');
      expect(result.selectionStart).toBe(4);
      expect(result.selectionEnd).toBe(8);
    });
  });

  describe('heading', () => {
    it('prefixes the single line under the cursor with ## ', () => {
      const result = applyToolbarAction('Title', 0, 5, 'heading');
      expect(result.text).toBe('## Title');
      expect(result.selectionStart).toBe(0);
      expect(result.selectionEnd).toBe(8);
    });

    it('prefixes every line spanned by a multi-line selection', () => {
      const result = applyToolbarAction('one\ntwo', 0, 7, 'heading');
      expect(result.text).toBe('## one\n## two');
    });

    it('inserts a placeholder template when nothing is selected', () => {
      const result = applyToolbarAction('', 0, 0, 'heading');
      expect(result.text).toBe('## Heading');
      expect(result.selectionStart).toBe(3);
      expect(result.selectionEnd).toBe(10);
    });
  });

  describe('unorderedList', () => {
    it('prefixes each selected line with - ', () => {
      const result = applyToolbarAction('one\ntwo', 0, 7, 'unorderedList');
      expect(result.text).toBe('- one\n- two');
      expect(result.selectionStart).toBe(0);
      expect(result.selectionEnd).toBe(11);
    });

    it('inserts a placeholder template when nothing is selected', () => {
      const result = applyToolbarAction('', 0, 0, 'unorderedList');
      expect(result.text).toBe('- list item');
      expect(result.selectionStart).toBe(2);
      expect(result.selectionEnd).toBe(11);
    });
  });

  describe('orderedList', () => {
    it('prefixes each selected line with 1. ', () => {
      const result = applyToolbarAction('one\ntwo', 0, 7, 'orderedList');
      expect(result.text).toBe('1. one\n1. two');
    });

    it('inserts a placeholder template when nothing is selected', () => {
      const result = applyToolbarAction('', 0, 0, 'orderedList');
      expect(result.text).toBe('1. list item');
      expect(result.selectionStart).toBe(3);
      expect(result.selectionEnd).toBe(12);
    });
  });

  describe('quote', () => {
    it('prefixes each selected line with > ', () => {
      const result = applyToolbarAction('one\ntwo', 0, 7, 'quote');
      expect(result.text).toBe('> one\n> two');
    });

    it('inserts a placeholder template when nothing is selected', () => {
      const result = applyToolbarAction('', 0, 0, 'quote');
      expect(result.text).toBe('> quote');
      expect(result.selectionStart).toBe(2);
      expect(result.selectionEnd).toBe(7);
    });
  });

  describe('horizontalRule', () => {
    it('inserts a horizontal rule at the cursor, replacing any selection', () => {
      const result = applyToolbarAction('before after', 6, 6, 'horizontalRule');
      expect(result.text).toBe('before\n---\n after');
      expect(result.selectionStart).toBe(11);
      expect(result.selectionEnd).toBe(11);
    });

    it('replaces a non-empty selection instead of wrapping it', () => {
      const result = applyToolbarAction('before middle after', 7, 13, 'horizontalRule');
      expect(result.text).toBe('before \n---\n after');
    });
  });
});

describe('renderMarkdownToSafeHtml', () => {
  it('renders standard markdown to HTML', () => {
    const html = renderMarkdownToSafeHtml('# Hello\n\nThis is **bold** and _italic_.');
    expect(html).toContain('<h1>Hello</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('renders GFM tables, strikethrough and task lists', () => {
    const html = renderMarkdownToSafeHtml(
      '~~gone~~\n\n- [ ] todo\n- [x] done\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n',
    );
    expect(html).toContain('<del>gone</del>');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('<table>');
  });

  it('strips script tags entirely', () => {
    const html = renderMarkdownToSafeHtml('Hello\n\n<script>alert("xss")</script>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert(');
  });

  it('strips inline event handler attributes', () => {
    const html = renderMarkdownToSafeHtml('<img src="x" onerror="alert(1)">');
    expect(html).not.toContain('onerror');
  });

  it('strips dangerous javascript: URLs from links', () => {
    const html = renderMarkdownToSafeHtml('[click me](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
  });

  it('wraps fenced code blocks with a language label', () => {
    const html = renderMarkdownToSafeHtml('```typescript\nconst a = 1;\n```');
    expect(html).toContain('data-language="typescript"');
    expect(html).toContain('const a = 1;');
  });

  it('returns an empty string for empty input', () => {
    expect(renderMarkdownToSafeHtml('')).toBe('');
    expect(renderMarkdownToSafeHtml('   ')).toBe('');
  });
});

describe('validateMarkdownUploadFile', () => {
  it('accepts a valid .md file', () => {
    const result = validateMarkdownUploadFile({
      name: 'notes.md',
      size: 100,
      type: 'text/markdown',
    });
    expect(result).toEqual({ valid: true });
  });

  it('accepts a .markdown file', () => {
    const result = validateMarkdownUploadFile({ name: 'notes.markdown', size: 100, type: '' });
    expect(result).toEqual({ valid: true });
  });

  it('rejects a file with the wrong extension', () => {
    const result = validateMarkdownUploadFile({
      name: 'notes.pdf',
      size: 100,
      type: 'application/pdf',
    });
    expect(result.valid).toBe(false);
  });

  it('rejects an empty file', () => {
    const result = validateMarkdownUploadFile({ name: 'notes.md', size: 0, type: 'text/markdown' });
    expect(result.valid).toBe(false);
  });

  it('rejects a file larger than the max upload size', () => {
    const result = validateMarkdownUploadFile({
      name: 'notes.md',
      size: MAX_MARKDOWN_UPLOAD_SIZE_BYTES + 1,
      type: 'text/markdown',
    });
    expect(result.valid).toBe(false);
  });
});

describe('buildStandaloneHtmlDocument', () => {
  it('wraps sanitized HTML in a standalone document with the given title', () => {
    const doc = buildStandaloneHtmlDocument('<h1>Hello</h1>', 'My Doc');
    expect(doc).toContain('<!doctype html>');
    expect(doc).toContain('<title>My Doc</title>');
    expect(doc).toContain('<h1>Hello</h1>');
  });
});
