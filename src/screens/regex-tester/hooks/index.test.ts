import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const { MockWorker, workerInstances } = vi.hoisted(() => {
  class MockWorker {
    onmessage: ((event: MessageEvent) => void) | null = null;
    postMessage = vi.fn();
    terminate = vi.fn();
  }
  const workerInstances: InstanceType<typeof MockWorker>[] = [];
  return { MockWorker, workerInstances };
});

vi.mock('../worker/createRegexWorker', () => ({
  createRegexWorker: () => {
    const worker = new MockWorker();
    workerInstances.push(worker);
    return worker;
  },
}));

import { useRegexTester } from './index';
import { DEBOUNCE_MS } from '~root/constants';

beforeEach(() => {
  workerInstances.length = 0;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useRegexTester', () => {
  it('starts idle with empty state', () => {
    const { result } = renderHook(() => useRegexTester());
    expect(result.current.execStatus).toBe('idle');
    expect(result.current.matches).toEqual([]);
    expect(result.current.syntaxError).toBeNull();
  });

  it('reports a syntax error synchronously, without waiting for the debounce', () => {
    const { result } = renderHook(() => useRegexTester());
    act(() => result.current.setPattern('(abc'));
    expect(result.current.syntaxError).not.toBeNull();
  });

  it('does not dispatch a worker while the pattern is empty', () => {
    const { result } = renderHook(() => useRegexTester());
    act(() => result.current.setTestString('aaa'));
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    expect(workerInstances).toHaveLength(0);
  });

  it('does not dispatch a worker while the test string is empty', () => {
    const { result } = renderHook(() => useRegexTester());
    act(() => result.current.setPattern('a'));
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    expect(workerInstances).toHaveLength(0);
  });

  it('dispatches a worker request after the debounce delay', () => {
    const { result } = renderHook(() => useRegexTester());
    act(() => {
      result.current.setPattern('a');
      result.current.setTestString('aaa');
    });
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));

    expect(workerInstances).toHaveLength(1);
    expect(workerInstances[0].postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ pattern: 'a', flags: 'g', testString: 'aaa', replacement: '' }),
    );
  });

  it('applies the worker response to matches/truncated/replacePreview', () => {
    const { result } = renderHook(() => useRegexTester());
    act(() => {
      result.current.setPattern('a');
      result.current.setTestString('aaa');
    });
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));

    const worker = workerInstances[0];
    const requestId = worker.postMessage.mock.calls[0][0].requestId;
    act(() => {
      worker.onmessage?.({
        data: {
          requestId,
          ok: true,
          matches: [{ index: 0, length: 1, value: 'a', groups: [] }],
          truncated: false,
          replacePreview: 'aaa',
        },
      } as MessageEvent);
    });

    expect(result.current.execStatus).toBe('done');
    expect(result.current.matches).toHaveLength(1);
    expect(result.current.replacePreview).toBe('aaa');
  });

  it('sets execStatus to error when the worker reports a runtime error', () => {
    const { result } = renderHook(() => useRegexTester());
    act(() => {
      result.current.setPattern('a');
      result.current.setTestString('aaa');
    });
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));

    const worker = workerInstances[0];
    const requestId = worker.postMessage.mock.calls[0][0].requestId;
    act(() => {
      worker.onmessage?.({ data: { requestId, ok: false, error: 'boom' } } as MessageEvent);
    });

    expect(result.current.execStatus).toBe('error');
    expect(result.current.execErrorMessage).toBe('boom');
  });

  it('loadExample sets pattern, flags, and testString together', () => {
    const { result } = renderHook(() => useRegexTester());
    act(() => {
      result.current.loadExample({ pattern: '\\d+', flags: 'g', sampleText: 'a1 b2' });
    });
    expect(result.current.pattern).toBe('\\d+');
    expect(result.current.flags).toBe('g');
    expect(result.current.testString).toBe('a1 b2');
  });

  it('toggleFlag adds and removes a flag', () => {
    const { result } = renderHook(() => useRegexTester());
    expect(result.current.flags).toBe('g');
    act(() => result.current.toggleFlag('i'));
    expect(result.current.flags).toBe('gi');
    act(() => result.current.toggleFlag('g'));
    expect(result.current.flags).toBe('i');
  });

  it('handleClear resets all state to empty', () => {
    const { result } = renderHook(() => useRegexTester());
    act(() => {
      result.current.setPattern('a');
      result.current.setTestString('aaa');
      result.current.setReplacement('b');
    });
    act(() => result.current.handleClear());

    expect(result.current.pattern).toBe('');
    expect(result.current.testString).toBe('');
    expect(result.current.replacement).toBe('');
    expect(result.current.execStatus).toBe('idle');
    expect(result.current.matches).toEqual([]);
  });
});
