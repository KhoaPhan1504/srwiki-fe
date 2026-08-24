import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';

vi.mock('~root/apis/useInspectHeaders', () => ({
  useInspectHeaders: vi.fn(),
}));

import { useInspectHeaders } from '~root/apis/useInspectHeaders';
import { ErrorCodes } from '~root/constants';
import type { HeaderInspectionResponse } from '~root/types';
import { useHeadersInspectorHooks } from '.';

const sampleResponse = (): HeaderInspectionResponse => ({
  statusCode: 200,
  reasonPhrase: 'OK',
  headers: [{ name: 'content-type', value: 'application/json' }],
  finalUrl: 'https://api.example.com/',
  redirectCount: 0,
  durationMs: 42,
  httpVersion: '1.1',
});

const backendAxiosError = (code: string, message: string) =>
  new AxiosError(message, 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 400,
    statusText: 'Bad Request',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    data: { detail: { code, message } },
  } as never);

describe('useHeadersInspectorHooks — initial state', () => {
  it('starts idle with empty url, no response, no error', () => {
    const mutateAsync = vi.fn();
    vi.mocked(useInspectHeaders).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useInspectHeaders>);

    const { result } = renderHook(() => useHeadersInspectorHooks());

    expect(result.current.url).toBe('');
    expect(result.current.submittedUrl).toBe('');
    expect(result.current.status).toBe('idle');
    expect(result.current.response).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

describe('useHeadersInspectorHooks — handleSend success', () => {
  it('moves idle -> sending -> success and stores the response', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(sampleResponse());
    vi.mocked(useInspectHeaders).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useInspectHeaders>);

    const { result } = renderHook(() => useHeadersInspectorHooks());
    act(() => result.current.setUrl('https://api.example.com'));

    let sendPromise!: Promise<void>;
    act(() => {
      sendPromise = result.current.handleSend();
    });
    expect(result.current.status).toBe('sending');

    await act(async () => {
      await sendPromise;
    });

    expect(mutateAsync).toHaveBeenCalledWith('https://api.example.com');
    expect(result.current.status).toBe('success');
    expect(result.current.response).toEqual(sampleResponse());
    expect(result.current.error).toBeNull();
  });

  it('sets submittedUrl to the URL that was actually sent, and keeps it stable if the input is edited afterward', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(sampleResponse());
    vi.mocked(useInspectHeaders).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useInspectHeaders>);

    const { result } = renderHook(() => useHeadersInspectorHooks());
    act(() => result.current.setUrl('https://api.example.com/a'));

    await act(async () => {
      await result.current.handleSend();
    });
    expect(result.current.submittedUrl).toBe('https://api.example.com/a');

    // Editing the input afterward (without sending again) must not move
    // submittedUrl — it stays pinned to the request that produced the
    // currently displayed response.
    act(() => result.current.setUrl('https://api.example.com/b'));
    expect(result.current.url).toBe('https://api.example.com/b');
    expect(result.current.submittedUrl).toBe('https://api.example.com/a');
  });
});

describe('useHeadersInspectorHooks — handleSend error mapping', () => {
  it('maps a 1:1 backend code (BLOCKED_URL) directly', async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue(backendAxiosError('BLOCKED_URL', 'This URL is not allowed'));
    vi.mocked(useInspectHeaders).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useInspectHeaders>);

    const { result } = renderHook(() => useHeadersInspectorHooks());
    act(() => result.current.setUrl('https://blocked.example.com'));

    await act(async () => {
      await result.current.handleSend();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toEqual({
      code: ErrorCodes.BLOCKED_URL,
      message: 'This URL is not allowed',
    });
    expect(result.current.response).toBeNull();
  });

  it('remaps backend CONNECTION_ERROR onto ErrorCodes.NETWORK_ERROR', async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue(backendAxiosError('CONNECTION_ERROR', 'Could not connect to host'));
    vi.mocked(useInspectHeaders).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useInspectHeaders>);

    const { result } = renderHook(() => useHeadersInspectorHooks());
    act(() => result.current.setUrl('https://unreachable.example.com'));

    await act(async () => {
      await result.current.handleSend();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toEqual({
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Could not connect to host',
    });
  });

  it('falls back to NETWORK_ERROR when the rejection has no backend detail', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('boom'));
    vi.mocked(useInspectHeaders).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useInspectHeaders>);

    const { result } = renderHook(() => useHeadersInspectorHooks());
    act(() => result.current.setUrl('https://api.example.com'));

    await act(async () => {
      await result.current.handleSend();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toEqual({
      code: ErrorCodes.NETWORK_ERROR,
      message: 'boom',
    });
  });
});

describe('useHeadersInspectorHooks — stale response guard', () => {
  it('ignores a send response that resolves after a newer send has already been requested', async () => {
    const resolvers: Array<(value: HeaderInspectionResponse) => void> = [];
    const mutateAsync = vi.fn().mockImplementation(
      () =>
        new Promise<HeaderInspectionResponse>((resolve) => {
          resolvers.push(resolve);
        }),
    );
    vi.mocked(useInspectHeaders).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useInspectHeaders>);

    const { result } = renderHook(() => useHeadersInspectorHooks());

    act(() => result.current.setUrl('https://api.example.com/first'));
    act(() => {
      result.current.handleSend();
    });

    act(() => result.current.setUrl('https://api.example.com/second'));
    act(() => {
      result.current.handleSend();
    });

    expect(resolvers).toHaveLength(2);

    // Newer (second) request settles first, as it normally would.
    await act(async () => {
      resolvers[1]({ ...sampleResponse(), finalUrl: 'https://api.example.com/second' });
    });
    expect(result.current.status).toBe('success');
    expect(result.current.response?.finalUrl).toBe('https://api.example.com/second');

    // Stale first request settles late — its result must be discarded.
    await act(async () => {
      resolvers[0]({ ...sampleResponse(), finalUrl: 'https://api.example.com/first' });
    });
    expect(result.current.response?.finalUrl).toBe('https://api.example.com/second');
    expect(result.current.status).toBe('success');
  });
});

describe('useHeadersInspectorHooks — handleClear', () => {
  it('resets url, status, response and error back to their initial values', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(sampleResponse());
    vi.mocked(useInspectHeaders).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useInspectHeaders>);

    const { result } = renderHook(() => useHeadersInspectorHooks());
    act(() => result.current.setUrl('https://api.example.com'));

    await act(async () => {
      await result.current.handleSend();
    });
    expect(result.current.status).toBe('success');

    act(() => result.current.handleClear());

    expect(result.current.url).toBe('');
    expect(result.current.submittedUrl).toBe('');
    expect(result.current.status).toBe('idle');
    expect(result.current.response).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('discards an in-flight response that resolves after handleClear', async () => {
    const resolvers: Array<(value: HeaderInspectionResponse) => void> = [];
    const mutateAsync = vi.fn().mockImplementation(
      () =>
        new Promise<HeaderInspectionResponse>((resolve) => {
          resolvers.push(resolve);
        }),
    );
    vi.mocked(useInspectHeaders).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useInspectHeaders>);

    const { result } = renderHook(() => useHeadersInspectorHooks());
    act(() => result.current.setUrl('https://api.example.com'));
    act(() => {
      result.current.handleSend();
    });
    expect(result.current.status).toBe('sending');

    act(() => result.current.handleClear());
    expect(result.current.status).toBe('idle');

    await act(async () => {
      resolvers[0](sampleResponse());
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.response).toBeNull();
  });
});
