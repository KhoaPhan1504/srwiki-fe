import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('~root/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~root/utils')>();
  return { ...actual, executeRestRequest: vi.fn() };
});

import { executeRestRequest } from '~root/utils';
import type { RestClientResult, RestResponse } from '~root/types';
import { useRestApiClientHooks } from '.';

const responseWithStatus = (status: number): RestResponse => ({
  status,
  statusText: 'OK',
  ok: status < 400,
  headers: {},
  durationMs: 1,
  sizeBytes: 0,
  body: { isJson: false, text: '' },
});

describe('useRestApiClientHooks — stale async response guard', () => {
  it('ignores a send response that resolves after a newer send has already been requested', async () => {
    const resolvers: Array<(value: RestClientResult) => void> = [];
    vi.mocked(executeRestRequest).mockImplementation(
      () => new Promise<RestClientResult>((resolve) => resolvers.push(resolve)),
    );

    const { result } = renderHook(() => useRestApiClientHooks());
    act(() => result.current.setUrl('https://api.example.com/first'));

    act(() => {
      result.current.handleSend();
    });
    act(() => {
      result.current.setUrl('https://api.example.com/second');
    });
    act(() => {
      result.current.handleSend();
    });

    expect(resolvers).toHaveLength(2);

    // The newer (second) request settles first, as it normally would.
    await act(async () => {
      resolvers[1]({ success: true, response: responseWithStatus(200) });
    });
    expect(result.current.status).toBe('success');
    expect(result.current.response?.status).toBe(200);

    // The stale first request settles late — its result must be discarded.
    await act(async () => {
      resolvers[0]({ success: true, response: responseWithStatus(500) });
    });
    expect(result.current.response?.status).toBe(200);
  });

  it('discards an in-flight response that resolves after handleClear', async () => {
    const resolvers: Array<(value: RestClientResult) => void> = [];
    vi.mocked(executeRestRequest).mockImplementation(
      () => new Promise<RestClientResult>((resolve) => resolvers.push(resolve)),
    );

    const { result } = renderHook(() => useRestApiClientHooks());
    act(() => result.current.setUrl('https://api.example.com'));
    act(() => {
      result.current.handleSend();
    });
    expect(result.current.status).toBe('sending');

    act(() => result.current.handleClear());
    expect(result.current.status).toBe('idle');

    await act(async () => {
      resolvers[0]({ success: true, response: responseWithStatus(200) });
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.response).toBeNull();
  });
});
