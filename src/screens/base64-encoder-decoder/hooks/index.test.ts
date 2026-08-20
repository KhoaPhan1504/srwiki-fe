import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useBase64EncoderDecoderHooks } from './index';

describe('useBase64EncoderDecoderHooks', () => {
  it('starts empty in encode mode with no error', () => {
    const { result } = renderHook(() => useBase64EncoderDecoderHooks());
    expect(result.current.mode).toBe('encode');
    expect(result.current.input).toBe('');
    expect(result.current.output).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('encodes the input live as it changes', () => {
    const { result } = renderHook(() => useBase64EncoderDecoderHooks());
    act(() => result.current.setInput('Hello'));
    expect(result.current.output).toBe('SGVsbG8=');
    expect(result.current.error).toBeNull();
  });

  it('decodes the input live once switched to decode mode', () => {
    const { result } = renderHook(() => useBase64EncoderDecoderHooks());
    act(() => result.current.setMode('decode'));
    act(() => result.current.setInput('SGVsbG8='));
    expect(result.current.output).toBe('Hello');
    expect(result.current.error).toBeNull();
  });

  it('switching mode re-converts the current input under the new mode', () => {
    const { result } = renderHook(() => useBase64EncoderDecoderHooks());
    act(() => result.current.setInput('SGVsbG8='));
    expect(result.current.output).toBe('U0dWc2JHOD0=');

    act(() => result.current.setMode('decode'));
    expect(result.current.output).toBe('Hello');
  });

  it('reports an INVALID_BASE64 error and clears output for malformed input in decode mode', () => {
    const { result } = renderHook(() => useBase64EncoderDecoderHooks());
    act(() => result.current.setMode('decode'));
    act(() => result.current.setInput('not valid base64!!!'));
    expect(result.current.output).toBe('');
    expect(result.current.error?.code).toBe('INVALID_BASE64');
  });

  it('clears the error once the input becomes empty again', () => {
    const { result } = renderHook(() => useBase64EncoderDecoderHooks());
    act(() => result.current.setMode('decode'));
    act(() => result.current.setInput('not valid base64!!!'));
    expect(result.current.error).not.toBeNull();

    act(() => result.current.setInput(''));
    expect(result.current.output).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('recovers from a stale decode error once the mode switches back to encode', () => {
    const { result } = renderHook(() => useBase64EncoderDecoderHooks());
    act(() => result.current.setMode('decode'));
    act(() => result.current.setInput('not valid base64!!!'));
    expect(result.current.error).not.toBeNull();

    act(() => result.current.setMode('encode'));
    expect(result.current.error).toBeNull();
    expect(result.current.output.length).toBeGreaterThan(0);
  });

  it('handleClear resets input, output, error but keeps the current mode', () => {
    const { result } = renderHook(() => useBase64EncoderDecoderHooks());
    act(() => result.current.setMode('decode'));
    act(() => result.current.setInput('not valid base64!!!'));

    act(() => result.current.handleClear());
    expect(result.current.input).toBe('');
    expect(result.current.output).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.mode).toBe('decode');
  });
});
