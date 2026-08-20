import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useColorConverterHooks } from '.';

describe('useColorConverterHooks', () => {
  it('starts with empty input and no result', () => {
    const { result } = renderHook(() => useColorConverterHooks());
    expect(result.current.input).toBe('');
    expect(result.current.result).toBeNull();
  });

  it('converts a hex input live to all formats', () => {
    const { result } = renderHook(() => useColorConverterHooks());
    act(() => result.current.setInput('#ff0000'));
    expect(result.current.result).toEqual({
      success: true,
      color: {
        format: 'hex',
        rgb: { r: 255, g: 0, b: 0 },
        hex: '#ff0000',
        rgbString: 'rgb(255, 0, 0)',
        hslString: 'hsl(0, 100%, 50%)',
      },
    });
  });

  it('converts an rgb() input live to all formats', () => {
    const { result } = renderHook(() => useColorConverterHooks());
    act(() => result.current.setInput('rgb(0, 255, 0)'));
    expect(result.current.result).toEqual({
      success: true,
      color: {
        format: 'rgb',
        rgb: { r: 0, g: 255, b: 0 },
        hex: '#00ff00',
        rgbString: 'rgb(0, 255, 0)',
        hslString: 'hsl(120, 100%, 50%)',
      },
    });
  });

  it('converts an hsl() input live to all formats', () => {
    const { result } = renderHook(() => useColorConverterHooks());
    act(() => result.current.setInput('hsl(240, 100%, 50%)'));
    expect(result.current.result).toEqual({
      success: true,
      color: {
        format: 'hsl',
        rgb: { r: 0, g: 0, b: 255 },
        hex: '#0000ff',
        rgbString: 'rgb(0, 0, 255)',
        hslString: 'hsl(240, 100%, 50%)',
      },
    });
  });

  it('reports INVALID_HEX for a malformed hex input', () => {
    const { result } = renderHook(() => useColorConverterHooks());
    act(() => result.current.setInput('#zzzzzz'));
    expect(result.current.result?.success).toBe(false);
    if (result.current.result?.success === false) {
      expect(result.current.result.error.code).toBe('INVALID_HEX');
    }
  });

  it('clears the result once the input becomes empty again', () => {
    const { result } = renderHook(() => useColorConverterHooks());
    act(() => result.current.setInput('#zzzzzz'));
    expect(result.current.result).not.toBeNull();

    act(() => result.current.setInput(''));
    expect(result.current.result).toBeNull();
  });

  it('handleClear resets input and result', () => {
    const { result } = renderHook(() => useColorConverterHooks());
    act(() => result.current.setInput('#ff0000'));
    expect(result.current.result).not.toBeNull();

    act(() => result.current.handleClear());
    expect(result.current.input).toBe('');
    expect(result.current.result).toBeNull();
  });
});
