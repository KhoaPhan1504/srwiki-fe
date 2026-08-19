import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useUuidGeneratorHooks } from './index';
import { UUIDCase, UUIDVersion } from '~root/constants';

describe('useUuidGeneratorHooks', () => {
  it('starts with v4, quantity 5, lowercase, hyphens and no results', () => {
    const { result } = renderHook(() => useUuidGeneratorHooks());
    expect(result.current.version).toBe(UUIDVersion.V4);
    expect(result.current.quantity).toBe('5');
    expect(result.current.caseOption).toBe(UUIDCase.LOWER);
    expect(result.current.removeHyphens).toBe(false);
    expect(result.current.results).toEqual([]);
    expect(result.current.resultsVersion).toBe(UUIDVersion.V4);
    expect(result.current.quantityValidation).toEqual({ valid: true, value: 5 });
  });

  it('handleGenerate replaces results with the requested quantity of v4 UUIDs', () => {
    const { result } = renderHook(() => useUuidGeneratorHooks());
    act(() => result.current.setQuantity('3'));
    act(() => result.current.handleGenerate());

    expect(result.current.results).toHaveLength(3);
    result.current.results.forEach((uuid) => {
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });

  it('handleGenerate generates v7 UUIDs when version is v7', () => {
    const { result } = renderHook(() => useUuidGeneratorHooks());
    act(() => result.current.setVersion(UUIDVersion.V7));
    act(() => result.current.handleGenerate());

    result.current.results.forEach((uuid) => {
      expect(uuid.charAt(14)).toBe('7');
    });
  });

  it('handleGenerate replaces, not appends, previous results', () => {
    const { result } = renderHook(() => useUuidGeneratorHooks());
    act(() => result.current.handleGenerate());
    const first = result.current.results;

    act(() => result.current.handleGenerate());
    expect(result.current.results).toHaveLength(first.length);
    expect(result.current.results).not.toEqual(first);
  });

  it('handleGenerate applies uppercase and hyphen removal', () => {
    const { result } = renderHook(() => useUuidGeneratorHooks());
    act(() => result.current.setCaseOption(UUIDCase.UPPER));
    act(() => result.current.setRemoveHyphens(true));
    act(() => result.current.handleGenerate());

    result.current.results.forEach((uuid) => {
      expect(uuid).toMatch(/^[0-9A-F]{32}$/);
    });
  });

  it('handleGenerate does nothing when the quantity is invalid', () => {
    const { result } = renderHook(() => useUuidGeneratorHooks());
    act(() => result.current.setQuantity('0'));
    act(() => result.current.handleGenerate());

    expect(result.current.results).toEqual([]);
    expect(result.current.quantityValidation).toEqual({ valid: false, reason: 'TOO_SMALL' });
  });

  it('resultsVersion keeps the version used to generate, unaffected by later selector changes', () => {
    const { result } = renderHook(() => useUuidGeneratorHooks());
    act(() => result.current.handleGenerate());
    expect(result.current.resultsVersion).toBe(UUIDVersion.V4);

    act(() => result.current.setVersion(UUIDVersion.V7));
    expect(result.current.resultsVersion).toBe(UUIDVersion.V4);
    result.current.results.forEach((uuid) => {
      expect(uuid.charAt(14)).toBe('4');
    });
  });

  it('handleClear empties the results without resetting the configuration', () => {
    const { result } = renderHook(() => useUuidGeneratorHooks());
    act(() => result.current.setVersion(UUIDVersion.V7));
    act(() => result.current.setQuantity('10'));
    act(() => result.current.handleGenerate());
    expect(result.current.results).toHaveLength(10);

    act(() => result.current.handleClear());
    expect(result.current.results).toEqual([]);
    expect(result.current.version).toBe(UUIDVersion.V7);
    expect(result.current.quantity).toBe('10');
  });
});
