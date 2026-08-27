import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { MockWorker, workerInstances } = vi.hoisted(() => {
  class MockWorker {
    onmessage: ((event: MessageEvent) => void) | null = null;
    postMessage = vi.fn();
    terminate = vi.fn();
  }
  const workerInstances: InstanceType<typeof MockWorker>[] = [];
  return { MockWorker, workerInstances };
});

vi.mock('~root/screens/regex-tester/worker', () => ({
  createRegexWorker: () => {
    const worker = new MockWorker();
    workerInstances.push(worker);
    return worker;
  },
}));

import { toolRegistry } from '~root/ai-tools';
import { WORKER_TIMEOUT_MS } from '~root/constants';

beforeEach(() => {
  workerInstances.length = 0;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('test_regex tool', () => {
  it('returns matches for a valid pattern', async () => {
    const resultPromise = toolRegistry.execute('test_regex', {
      pattern: '\\d+',
      flags: 'g',
      testString: 'a1 b22',
    });

    const worker = workerInstances[0];
    worker.onmessage?.({
      data: {
        requestId: 0,
        ok: true,
        matches: [
          { index: 1, length: 1, value: '1', groups: [], namedGroups: undefined },
          { index: 4, length: 2, value: '22', groups: [], namedGroups: undefined },
        ],
        truncated: false,
        replacePreview: '',
      },
    } as MessageEvent);

    const result = await resultPromise;

    expect(result).toEqual({
      success: true,
      data: {
        matches: [
          { index: 1, length: 1, value: '1', groups: [], namedGroups: undefined },
          { index: 4, length: 2, value: '22', groups: [], namedGroups: undefined },
        ],
        truncated: false,
      },
    });
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  it('returns a validation error for an invalid pattern without ever touching the worker', async () => {
    const result = await toolRegistry.execute('test_regex', {
      pattern: '(',
      flags: '',
      testString: 'abc',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
    }
    expect(workerInstances).toHaveLength(0);
  });

  it('terminates the worker and returns an execution error on timeout', async () => {
    const resultPromise = toolRegistry.execute('test_regex', {
      pattern: '(a+)+$',
      flags: '',
      testString: 'a'.repeat(40) + '!',
    });

    const worker = workerInstances[0];
    await vi.advanceTimersByTimeAsync(WORKER_TIMEOUT_MS);

    const result = await resultPromise;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('execution');
      expect(result.error.code).toBe('TIMEOUT');
    }
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });
});
