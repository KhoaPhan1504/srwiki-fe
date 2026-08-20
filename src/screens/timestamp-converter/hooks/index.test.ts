import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TimestampConversionMode, TimestampUnit } from '~root/constants';
import { useTimestampConverterHooks } from '.';

describe('useTimestampConverterHooks', () => {
  it('starts in Timestamp → Date mode, seconds unit, local timezone, with no result', () => {
    const { result } = renderHook(() => useTimestampConverterHooks());
    expect(result.current.mode).toBe(TimestampConversionMode.TIMESTAMP_TO_DATE);
    expect(result.current.unit).toBe(TimestampUnit.SECONDS);
    expect(result.current.timezoneMode).toBe('local');
    expect(result.current.input).toBe('');
    expect(result.current.timestampToDateResult).toBeNull();
    expect(result.current.dateToTimestampResult).toBeNull();
  });

  it('converts a seconds timestamp live', () => {
    const { result } = renderHook(() => useTimestampConverterHooks());
    act(() => result.current.setInput('0'));
    expect(result.current.timestampToDateResult).toEqual({
      success: true,
      date: new Date(0),
      milliseconds: 0,
    });
  });

  it('re-converts the current input when the unit changes', () => {
    const { result } = renderHook(() => useTimestampConverterHooks());
    act(() => result.current.setInput('1000'));
    expect(result.current.timestampToDateResult).toEqual({
      success: true,
      date: new Date(1_000_000),
      milliseconds: 1_000_000,
    });

    act(() => result.current.setUnit(TimestampUnit.MILLISECONDS));
    expect(result.current.timestampToDateResult).toEqual({
      success: true,
      date: new Date(1000),
      milliseconds: 1000,
    });
  });

  it('reports INVALID_TIMESTAMP for non-numeric input', () => {
    const { result } = renderHook(() => useTimestampConverterHooks());
    act(() => result.current.setInput('not-a-timestamp'));
    expect(result.current.timestampToDateResult?.success).toBe(false);
    if (result.current.timestampToDateResult?.success === false) {
      expect(result.current.timestampToDateResult.error.code).toBe('INVALID_TIMESTAMP');
    }
  });

  it('clears the result once the input becomes empty again', () => {
    const { result } = renderHook(() => useTimestampConverterHooks());
    act(() => result.current.setInput('not-a-timestamp'));
    expect(result.current.timestampToDateResult).not.toBeNull();

    act(() => result.current.setInput(''));
    expect(result.current.timestampToDateResult).toBeNull();
  });

  it('switching mode clears the input and both results', () => {
    const { result } = renderHook(() => useTimestampConverterHooks());
    act(() => result.current.setInput('0'));
    expect(result.current.timestampToDateResult).not.toBeNull();

    act(() => result.current.setMode(TimestampConversionMode.DATE_TO_TIMESTAMP));
    expect(result.current.mode).toBe(TimestampConversionMode.DATE_TO_TIMESTAMP);
    expect(result.current.input).toBe('');
    expect(result.current.timestampToDateResult).toBeNull();
    expect(result.current.dateToTimestampResult).toBeNull();
  });

  it('converts a date string live in Date → Timestamp mode', () => {
    const { result } = renderHook(() => useTimestampConverterHooks());
    act(() => result.current.setMode(TimestampConversionMode.DATE_TO_TIMESTAMP));
    act(() => result.current.setTimezoneMode('UTC'));
    act(() => result.current.setInput('2024-01-15T00:00:00'));

    expect(result.current.dateToTimestampResult).toEqual({
      success: true,
      seconds: Date.UTC(2024, 0, 15) / 1000,
      milliseconds: Date.UTC(2024, 0, 15),
    });
  });

  it('re-converts the current input when the timezone mode changes', () => {
    const { result } = renderHook(() => useTimestampConverterHooks());
    act(() => result.current.setMode(TimestampConversionMode.DATE_TO_TIMESTAMP));
    act(() => result.current.setInput('2024-01-15T00:00:00'));
    const localMs = result.current.dateToTimestampResult;
    expect(localMs).toEqual({
      success: true,
      seconds: Math.floor(new Date(2024, 0, 15).getTime() / 1000),
      milliseconds: new Date(2024, 0, 15).getTime(),
    });

    act(() => result.current.setTimezoneMode('UTC'));
    expect(result.current.dateToTimestampResult).toEqual({
      success: true,
      seconds: Date.UTC(2024, 0, 15) / 1000,
      milliseconds: Date.UTC(2024, 0, 15),
    });
  });

  it('reports INVALID_DATE for an unrecognized date string', () => {
    const { result } = renderHook(() => useTimestampConverterHooks());
    act(() => result.current.setMode(TimestampConversionMode.DATE_TO_TIMESTAMP));
    act(() => result.current.setInput('not a date'));

    expect(result.current.dateToTimestampResult?.success).toBe(false);
    if (result.current.dateToTimestampResult?.success === false) {
      expect(result.current.dateToTimestampResult.error.code).toBe('INVALID_DATE');
    }
  });

  it('handleClear resets input and both results but keeps mode/unit/timezone', () => {
    const { result } = renderHook(() => useTimestampConverterHooks());
    act(() => result.current.setMode(TimestampConversionMode.DATE_TO_TIMESTAMP));
    act(() => result.current.setTimezoneMode('UTC'));
    act(() => result.current.setInput('2024-01-15T00:00:00'));

    act(() => result.current.handleClear());
    expect(result.current.input).toBe('');
    expect(result.current.timestampToDateResult).toBeNull();
    expect(result.current.dateToTimestampResult).toBeNull();
    expect(result.current.mode).toBe(TimestampConversionMode.DATE_TO_TIMESTAMP);
    expect(result.current.timezoneMode).toBe('UTC');
  });
});
