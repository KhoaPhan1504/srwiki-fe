import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useJsonFormatterHooks } from './index';

describe('useJsonFormatterHooks', () => {
  it('starts empty and idle', () => {
    const { result } = renderHook(() => useJsonFormatterHooks());
    expect(result.current.input).toBe('');
    expect(result.current.output).toBe('');
    expect(result.current.indent).toBe(2);
    expect(result.current.error).toBeNull();
    expect(result.current.status).toBe('idle');
  });

  it('handleFormat sets output and status on valid input', () => {
    const { result } = renderHook(() => useJsonFormatterHooks());
    act(() => result.current.setInput('{"a":1}'));
    act(() => result.current.handleFormat());
    expect(result.current.output).toBe('{\n  "a": 1\n}');
    expect(result.current.status).toBe('valid');
    expect(result.current.error).toBeNull();
  });

  it('handleFormat sets an error and clears output on invalid input', () => {
    const { result } = renderHook(() => useJsonFormatterHooks());
    act(() => result.current.setInput('{a:1}'));
    act(() => result.current.handleFormat());
    expect(result.current.output).toBe('');
    expect(result.current.status).toBe('invalid');
    expect(result.current.error?.code).toBe('PARSE_ERROR');
  });

  it('handleMinify sets a compact output', () => {
    const { result } = renderHook(() => useJsonFormatterHooks());
    act(() => result.current.setInput('{\n  "a": 1\n}'));
    act(() => result.current.handleMinify());
    expect(result.current.output).toBe('{"a":1}');
    expect(result.current.status).toBe('valid');
  });

  it('handleValidate sets status without touching output', () => {
    const { result } = renderHook(() => useJsonFormatterHooks());
    act(() => result.current.setInput('{"a":1}'));
    act(() => result.current.handleValidate());
    expect(result.current.status).toBe('valid');
    expect(result.current.output).toBe('');
  });

  it('handleValidate reports an error for invalid input', () => {
    const { result } = renderHook(() => useJsonFormatterHooks());
    act(() => result.current.setInput('{a:1}'));
    act(() => result.current.handleValidate());
    expect(result.current.status).toBe('invalid');
    expect(result.current.error?.code).toBe('PARSE_ERROR');
  });

  it('setInput resets a stale error/status from a previous action', () => {
    const { result } = renderHook(() => useJsonFormatterHooks());
    act(() => result.current.setInput('{a:1}'));
    act(() => result.current.handleValidate());
    expect(result.current.status).toBe('invalid');

    act(() => result.current.setInput('{"a":1}'));
    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it('handleFileLoaded sets input and validates it immediately', () => {
    const { result } = renderHook(() => useJsonFormatterHooks());
    act(() => result.current.handleFileLoaded('{"a":1}'));
    expect(result.current.input).toBe('{"a":1}');
    expect(result.current.status).toBe('valid');
  });

  it('handleFileLoaded surfaces a parse error for invalid file content', () => {
    const { result } = renderHook(() => useJsonFormatterHooks());
    act(() => result.current.handleFileLoaded('{a:1}'));
    expect(result.current.input).toBe('{a:1}');
    expect(result.current.status).toBe('invalid');
    expect(result.current.error?.code).toBe('PARSE_ERROR');
  });

  it('handleClear resets input, output, error and status', () => {
    const { result } = renderHook(() => useJsonFormatterHooks());
    act(() => result.current.setInput('{"a":1}'));
    act(() => result.current.handleFormat());
    expect(result.current.output).not.toBe('');

    act(() => result.current.handleClear());
    expect(result.current.input).toBe('');
    expect(result.current.output).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.status).toBe('idle');
  });
});
