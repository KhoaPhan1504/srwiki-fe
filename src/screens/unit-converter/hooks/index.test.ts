import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UnitCategory } from '~root/constants';
import { useUnitConverterHooks } from '.';

describe('useUnitConverterHooks', () => {
  it('starts with the length category, px unit, empty input, and no result', () => {
    const { result } = renderHook(() => useUnitConverterHooks());
    expect(result.current.category).toBe('length');
    expect(result.current.unit).toBe('px');
    expect(result.current.input).toBe('');
    expect(result.current.result).toBeNull();
  });

  it('converts a length input live using the default base font size', () => {
    const { result } = renderHook(() => useUnitConverterHooks());
    act(() => result.current.setInput('16'));
    const conversion = result.current.result;
    if (!conversion || !conversion.success || conversion.category !== UnitCategory.LENGTH) {
      throw new Error('expected length success');
    }
    expect(conversion.values.px).toBe(16);
    expect(conversion.values.rem).toBe(1);
  });

  it('re-converts when the unit changes', () => {
    const { result } = renderHook(() => useUnitConverterHooks());
    act(() => result.current.setInput('1'));
    act(() => result.current.setUnit('in'));
    const conversion = result.current.result;
    if (!conversion || !conversion.success || conversion.category !== UnitCategory.LENGTH) {
      throw new Error('expected length success');
    }
    expect(conversion.values.px).toBe(96);
  });

  it('re-converts when the base font size changes', () => {
    const { result } = renderHook(() => useUnitConverterHooks());
    act(() => result.current.setUnit('rem'));
    act(() => result.current.setInput('2'));
    act(() => result.current.setBaseFontSizePx('20'));
    const conversion = result.current.result;
    if (!conversion || !conversion.success || conversion.category !== UnitCategory.LENGTH) {
      throw new Error('expected length success');
    }
    expect(conversion.values.px).toBe(40);
  });

  it('switching category resets unit, input, and result', () => {
    const { result } = renderHook(() => useUnitConverterHooks());
    act(() => result.current.setInput('16'));
    act(() => result.current.setCategory(UnitCategory.DATA));
    expect(result.current.category).toBe('data');
    expect(result.current.unit).toBe('B');
    expect(result.current.input).toBe('');
    expect(result.current.result).toBeNull();
  });

  it('clears the result once the input becomes empty again', () => {
    const { result } = renderHook(() => useUnitConverterHooks());
    act(() => result.current.setInput('abc'));
    expect(result.current.result).not.toBeNull();

    act(() => result.current.setInput(''));
    expect(result.current.result).toBeNull();
  });

  it('reports INVALID_NUMBER for non-numeric input', () => {
    const { result } = renderHook(() => useUnitConverterHooks());
    act(() => result.current.setInput('abc'));
    expect(result.current.result?.success).toBe(false);
    if (result.current.result?.success !== false) throw new Error('expected failure');
    expect(result.current.result.error.code).toBe('INVALID_NUMBER');
  });

  it('reports NEGATIVE_NOT_ALLOWED for a negative data value', () => {
    const { result } = renderHook(() => useUnitConverterHooks());
    act(() => result.current.setCategory(UnitCategory.DATA));
    act(() => result.current.setInput('-5'));
    expect(result.current.result?.success).toBe(false);
    if (result.current.result?.success !== false) throw new Error('expected failure');
    expect(result.current.result.error.code).toBe('NEGATIVE_NOT_ALLOWED');
  });

  it('handleClear resets input and result', () => {
    const { result } = renderHook(() => useUnitConverterHooks());
    act(() => result.current.setInput('16'));
    expect(result.current.result).not.toBeNull();

    act(() => result.current.handleClear());
    expect(result.current.input).toBe('');
    expect(result.current.result).toBeNull();
  });
});
