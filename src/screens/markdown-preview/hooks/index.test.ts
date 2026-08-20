import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useMarkdownPreview } from './index';
import { DEBOUNCE_MS } from '~root/constants';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useMarkdownPreview', () => {
  it('starts empty, in split view, with an empty preview', () => {
    const { result } = renderHook(() => useMarkdownPreview());
    expect(result.current.markdown).toBe('');
    expect(result.current.viewMode).toBe('split');
    expect(result.current.html).toBe('');
  });

  it('setMarkdown updates the markdown source', () => {
    const { result } = renderHook(() => useMarkdownPreview());
    act(() => result.current.setMarkdown('# Hello'));
    expect(result.current.markdown).toBe('# Hello');
  });

  it('renders a debounced, sanitized preview after the source settles', () => {
    const { result } = renderHook(() => useMarkdownPreview());
    act(() => result.current.setMarkdown('# Hello'));
    expect(result.current.html).toBe('');

    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    expect(result.current.html).toContain('<h1>Hello</h1>');
  });

  it('setViewMode switches the active view mode', () => {
    const { result } = renderHook(() => useMarkdownPreview());
    act(() => result.current.setViewMode('preview'));
    expect(result.current.viewMode).toBe('preview');
  });

  it('handleToolbarAction updates the markdown and returns the new selection', () => {
    const { result } = renderHook(() => useMarkdownPreview());
    let selection: { text: string; selectionStart: number; selectionEnd: number };
    act(() => {
      selection = result.current.handleToolbarAction('bold', 0, 0);
    });
    expect(result.current.markdown).toBe('**bold text**');
    expect(selection!.selectionStart).toBe(2);
    expect(selection!.selectionEnd).toBe(11);
  });

  it('handleFileLoaded replaces the markdown source', () => {
    const { result } = renderHook(() => useMarkdownPreview());
    act(() => result.current.setMarkdown('old content'));
    act(() => result.current.handleFileLoaded('# Loaded from file'));
    expect(result.current.markdown).toBe('# Loaded from file');
  });

  it('loadExample replaces the markdown source with the example content', () => {
    const { result } = renderHook(() => useMarkdownPreview());
    act(() => result.current.loadExample({ id: 'demo', labelKey: 'x', content: '# Demo' }));
    expect(result.current.markdown).toBe('# Demo');
  });

  it('handleClear resets the markdown source', () => {
    const { result } = renderHook(() => useMarkdownPreview());
    act(() => result.current.setMarkdown('# Hello'));
    act(() => result.current.handleClear());
    expect(result.current.markdown).toBe('');
  });
});
