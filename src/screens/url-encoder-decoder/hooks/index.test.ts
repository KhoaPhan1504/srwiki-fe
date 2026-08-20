import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useUrlEncoderDecoderHooks } from '.';
import { OperationMode } from '~root/constants';

describe('useUrlEncoderDecoderHooks', () => {
  it('starts empty in encode mode with no error', () => {
    const { result } = renderHook(() => useUrlEncoderDecoderHooks());
    expect(result.current.mode).toBe(OperationMode.ENCODE);
    expect(result.current.input).toBe('');
    expect(result.current.output).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('encodes the input live as it changes', () => {
    const { result } = renderHook(() => useUrlEncoderDecoderHooks());
    act(() => result.current.setInput('hello world'));
    expect(result.current.output).toBe('hello%20world');
    expect(result.current.error).toBeNull();
  });

  it('decodes the input live once switched to decode mode', () => {
    const { result } = renderHook(() => useUrlEncoderDecoderHooks());
    act(() => result.current.setMode(OperationMode.DECODE));
    act(() => result.current.setInput('hello%20world'));
    expect(result.current.output).toBe('hello world');
    expect(result.current.error).toBeNull();
  });

  it('switching mode re-converts the current input under the new mode', () => {
    const { result } = renderHook(() => useUrlEncoderDecoderHooks());
    act(() => result.current.setInput('a b'));
    expect(result.current.output).toBe('a%20b');

    act(() => result.current.setMode(OperationMode.DECODE));
    expect(result.current.output).toBe('a b');
  });

  it('reports an INVALID_URI_ENCODING error and clears output for malformed input in decode mode', () => {
    const { result } = renderHook(() => useUrlEncoderDecoderHooks());
    act(() => result.current.setMode(OperationMode.DECODE));
    act(() => result.current.setInput('100% done'));
    expect(result.current.output).toBe('');
    expect(result.current.error?.code).toBe('INVALID_URI_ENCODING');
  });

  it('clears the error once the input becomes empty again', () => {
    const { result } = renderHook(() => useUrlEncoderDecoderHooks());
    act(() => result.current.setMode(OperationMode.DECODE));
    act(() => result.current.setInput('100% done'));
    expect(result.current.error).not.toBeNull();

    act(() => result.current.setInput(''));
    expect(result.current.output).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('recovers from a stale decode error once the mode switches back to encode', () => {
    const { result } = renderHook(() => useUrlEncoderDecoderHooks());
    act(() => result.current.setMode(OperationMode.DECODE));
    act(() => result.current.setInput('100% done'));
    expect(result.current.error).not.toBeNull();

    act(() => result.current.setMode(OperationMode.ENCODE));
    expect(result.current.error).toBeNull();
    expect(result.current.output.length).toBeGreaterThan(0);
  });

  it('handleClear resets input, output, error but keeps the current mode', () => {
    const { result } = renderHook(() => useUrlEncoderDecoderHooks());
    act(() => result.current.setMode(OperationMode.DECODE));
    act(() => result.current.setInput('100% done'));

    act(() => result.current.handleClear());
    expect(result.current.input).toBe('');
    expect(result.current.output).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.mode).toBe(OperationMode.DECODE);
  });
});
