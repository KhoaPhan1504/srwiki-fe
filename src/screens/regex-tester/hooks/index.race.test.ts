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
import { DEBOUNCE_MS, WORKER_TIMEOUT_MS } from '~root/constants';

beforeEach(() => {
  workerInstances.length = 0;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useRegexTester — stale response and timeout guards', () => {
  it('ignores a worker response whose requestId is not the latest', () => {
    const { result } = renderHook(() => useRegexTester());
    act(() => {
      result.current.setPattern('a');
      result.current.setTestString('aaa');
    });
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    const firstWorker = workerInstances[0];
    const firstRequestId = firstWorker.postMessage.mock.calls[0][0].requestId;

    act(() => result.current.setTestString('bbb'));
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    expect(workerInstances).toHaveLength(2);

    act(() => {
      firstWorker.onmessage?.({
        data: {
          requestId: firstRequestId,
          ok: true,
          matches: [],
          truncated: false,
          replacePreview: 'STALE',
        },
      } as MessageEvent);
    });

    expect(result.current.replacePreview).not.toBe('STALE');
  });

  it('terminates the worker and sets timeout status when it exceeds WORKER_TIMEOUT_MS', () => {
    const { result } = renderHook(() => useRegexTester());
    act(() => {
      result.current.setPattern('(a+)+$');
      result.current.setTestString('a'.repeat(40) + '!');
    });
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    const worker = workerInstances[0];

    act(() => vi.advanceTimersByTime(WORKER_TIMEOUT_MS));

    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(result.current.execStatus).toBe('timeout');
  });

  it('a late response arriving after the watchdog already fired is ignored', () => {
    const { result } = renderHook(() => useRegexTester());
    act(() => {
      result.current.setPattern('a');
      result.current.setTestString('aaa');
    });
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    const worker = workerInstances[0];
    const requestId = worker.postMessage.mock.calls[0][0].requestId;

    act(() => vi.advanceTimersByTime(WORKER_TIMEOUT_MS));
    expect(result.current.execStatus).toBe('timeout');

    act(() => {
      worker.onmessage?.({
        data: { requestId, ok: true, matches: [], truncated: false, replacePreview: 'late' },
      } as MessageEvent);
    });
    expect(result.current.execStatus).toBe('timeout');
  });

  it('terminates the active worker when the hook unmounts', () => {
    const { result, unmount } = renderHook(() => useRegexTester());
    act(() => {
      result.current.setPattern('a');
      result.current.setTestString('aaa');
    });
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    const worker = workerInstances[0];

    unmount();

    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });
});
