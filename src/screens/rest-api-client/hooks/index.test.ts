import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('~root/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~root/utils')>();
  return { ...actual, executeRestRequest: vi.fn() };
});

import { executeRestRequest } from '~root/utils';
import { ErrorCodes } from '~root/constants';
import type { RestResponse, SavedRequest } from '~root/types';
import { useRestApiClientHooks } from '.';

const sampleSavedRequest = (): SavedRequest => ({
  id: 'r1',
  collectionId: 'c1',
  name: 'Get profile',
  method: 'POST',
  url: 'https://api.example.com/profile',
  queryParams: [{ id: 'q1', key: 'page', value: '2', enabled: true }],
  headers: [{ id: 'h1', key: 'X-Test', value: '1', enabled: true }],
  body: '{"a":1}',
  bodyType: 'raw',
  bodyFields: [{ id: 'b1', key: 'a', value: '1', enabled: true }],
  auth: { type: 'bearer', token: 'abc' },
  createdAt: '2026-08-21T00:00:00Z',
  updatedAt: '2026-08-21T00:00:00Z',
});

const sampleResponse = (): RestResponse => ({
  status: 200,
  statusText: 'OK',
  ok: true,
  headers: { 'content-type': 'application/json' },
  durationMs: 12,
  sizeBytes: 2,
  body: { isJson: true, json: {}, text: '{}' },
});

describe('useRestApiClientHooks — initial state', () => {
  it('starts idle with a single empty query-param and header row', () => {
    const { result } = renderHook(() => useRestApiClientHooks());

    expect(result.current.method).toBe('GET');
    expect(result.current.url).toBe('');
    expect(result.current.body).toBe('');
    expect(result.current.status).toBe('idle');
    expect(result.current.response).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.queryParams).toHaveLength(1);
    expect(result.current.headers).toHaveLength(1);
  });
});

describe('useRestApiClientHooks — field setters', () => {
  it('updates method, url and body', () => {
    const { result } = renderHook(() => useRestApiClientHooks());

    act(() => result.current.setMethod('POST'));
    act(() => result.current.setUrl('https://api.example.com'));
    act(() => result.current.setBody('{"a":1}'));

    expect(result.current.method).toBe('POST');
    expect(result.current.url).toBe('https://api.example.com');
    expect(result.current.body).toBe('{"a":1}');
  });
});

describe('useRestApiClientHooks — query param rows', () => {
  it('adds, updates and removes a row', () => {
    const { result } = renderHook(() => useRestApiClientHooks());

    act(() => result.current.addQueryParam());
    expect(result.current.queryParams).toHaveLength(2);

    const [first] = result.current.queryParams;
    act(() => result.current.updateQueryParam(first.id, { key: 'page', value: '2' }));
    expect(result.current.queryParams[0]).toMatchObject({ key: 'page', value: '2' });

    act(() => result.current.removeQueryParam(first.id));
    expect(result.current.queryParams).toHaveLength(1);
    expect(result.current.queryParams[0].id).not.toBe(first.id);
  });
});

describe('useRestApiClientHooks — header rows', () => {
  it('adds, updates and removes a row', () => {
    const { result } = renderHook(() => useRestApiClientHooks());

    act(() => result.current.addHeader());
    expect(result.current.headers).toHaveLength(2);

    const [first] = result.current.headers;
    act(() => result.current.updateHeader(first.id, { key: 'X-Test', value: '1' }));
    expect(result.current.headers[0]).toMatchObject({ key: 'X-Test', value: '1' });

    act(() => result.current.removeHeader(first.id));
    expect(result.current.headers).toHaveLength(1);
    expect(result.current.headers[0].id).not.toBe(first.id);
  });
});

describe('useRestApiClientHooks — body type and fields', () => {
  it('defaults to raw with a single empty field row', () => {
    const { result } = renderHook(() => useRestApiClientHooks());
    expect(result.current.bodyType).toBe('raw');
    expect(result.current.bodyFields).toHaveLength(1);
  });

  it('updates bodyType and adds/updates/removes body field rows', () => {
    const { result } = renderHook(() => useRestApiClientHooks());

    act(() => result.current.setBodyType('urlEncoded'));
    expect(result.current.bodyType).toBe('urlEncoded');

    act(() => result.current.addBodyField());
    expect(result.current.bodyFields).toHaveLength(2);

    const [first] = result.current.bodyFields;
    act(() => result.current.updateBodyField(first.id, { key: 'a', value: '1' }));
    expect(result.current.bodyFields[0]).toMatchObject({ key: 'a', value: '1' });

    act(() => result.current.removeBodyField(first.id));
    expect(result.current.bodyFields).toHaveLength(1);
    expect(result.current.bodyFields[0].id).not.toBe(first.id);
  });

  it('passes bodyType and bodyFields through to executeRestRequest on send', async () => {
    vi.mocked(executeRestRequest).mockResolvedValue({ success: true, response: sampleResponse() });
    const { result } = renderHook(() => useRestApiClientHooks());
    act(() => result.current.setUrl('https://api.example.com'));
    act(() => result.current.setBodyType('formData'));
    act(() => result.current.updateBodyField(result.current.bodyFields[0].id, { key: 'a' }));

    await act(async () => {
      await result.current.handleSend();
    });

    expect(executeRestRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        bodyType: 'formData',
        bodyFields: [expect.objectContaining({ key: 'a' })],
      }),
      expect.any(AbortSignal),
    );
  });
});

describe('useRestApiClientHooks — loadSavedRequest', () => {
  it('defaults loadedRequestId to null', () => {
    const { result } = renderHook(() => useRestApiClientHooks());
    expect(result.current.loadedRequestId).toBeNull();
  });

  it('replaces the entire builder state and sets loadedRequestId', () => {
    const { result } = renderHook(() => useRestApiClientHooks());

    act(() => result.current.loadSavedRequest(sampleSavedRequest()));

    expect(result.current.method).toBe('POST');
    expect(result.current.url).toBe('https://api.example.com/profile');
    expect(result.current.queryParams).toEqual([
      { id: 'q1', key: 'page', value: '2', enabled: true },
    ]);
    expect(result.current.headers).toEqual([
      { id: 'h1', key: 'X-Test', value: '1', enabled: true },
    ]);
    expect(result.current.body).toBe('{"a":1}');
    expect(result.current.bodyType).toBe('raw');
    expect(result.current.bodyFields).toEqual([{ id: 'b1', key: 'a', value: '1', enabled: true }]);
    expect(result.current.auth).toEqual({ type: 'bearer', token: 'abc' });
    expect(result.current.loadedRequestId).toBe('r1');
  });
});

describe('useRestApiClientHooks — environmentId', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to null when nothing is stored', () => {
    const { result } = renderHook(() => useRestApiClientHooks());
    expect(result.current.environmentId).toBeNull();
  });

  it('reads the stored environment id on mount and persists changes', () => {
    localStorage.setItem('rest-api-client-environment-id', 'env-1');
    const { result } = renderHook(() => useRestApiClientHooks());
    expect(result.current.environmentId).toBe('env-1');

    act(() => result.current.setEnvironmentId('env-2'));
    expect(result.current.environmentId).toBe('env-2');
    expect(localStorage.getItem('rest-api-client-environment-id')).toBe('env-2');

    act(() => result.current.setEnvironmentId(null));
    expect(localStorage.getItem('rest-api-client-environment-id')).toBeNull();
  });
});

describe('useRestApiClientHooks — handleSend with variables', () => {
  it('substitutes variables into the config passed to executeRestRequest', async () => {
    vi.mocked(executeRestRequest).mockResolvedValue({ success: true, response: sampleResponse() });
    const { result } = renderHook(() => useRestApiClientHooks());
    act(() => result.current.setUrl('{{base_url}}/users'));

    await act(async () => {
      await result.current.handleSend([
        { id: 'v1', key: 'base_url', value: 'https://api.example.com', enabled: true },
      ]);
    });

    expect(executeRestRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://api.example.com/users' }),
      expect.any(AbortSignal),
    );
  });

  it('sends the config unchanged when called with no variables', async () => {
    vi.mocked(executeRestRequest).mockResolvedValue({ success: true, response: sampleResponse() });
    const { result } = renderHook(() => useRestApiClientHooks());
    act(() => result.current.setUrl('https://api.example.com'));

    await act(async () => {
      await result.current.handleSend();
    });

    expect(executeRestRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://api.example.com' }),
      expect.any(AbortSignal),
    );
  });
});

describe('useRestApiClientHooks — auth', () => {
  it('defaults to no auth and updates when set', () => {
    const { result } = renderHook(() => useRestApiClientHooks());
    expect(result.current.auth).toEqual({ type: 'none' });

    act(() => result.current.setAuth({ type: 'bearer', token: 'abc' }));
    expect(result.current.auth).toEqual({ type: 'bearer', token: 'abc' });
  });

  it('passes auth through to executeRestRequest on send', async () => {
    vi.mocked(executeRestRequest).mockResolvedValue({ success: true, response: sampleResponse() });
    const { result } = renderHook(() => useRestApiClientHooks());
    act(() => result.current.setUrl('https://api.example.com'));
    act(() => result.current.setAuth({ type: 'bearer', token: 'abc' }));

    await act(async () => {
      await result.current.handleSend();
    });

    expect(executeRestRequest).toHaveBeenCalledWith(
      expect.objectContaining({ auth: { type: 'bearer', token: 'abc' } }),
      expect.any(AbortSignal),
    );
  });
});

describe('useRestApiClientHooks — handleSend', () => {
  it('moves to success and stores the response', async () => {
    vi.mocked(executeRestRequest).mockResolvedValue({ success: true, response: sampleResponse() });
    const { result } = renderHook(() => useRestApiClientHooks());
    act(() => result.current.setUrl('https://api.example.com'));

    await act(async () => {
      await result.current.handleSend();
    });

    expect(result.current.status).toBe('success');
    expect(result.current.response).toEqual(sampleResponse());
    expect(result.current.error).toBeNull();
  });

  it('moves to error and stores the error', async () => {
    vi.mocked(executeRestRequest).mockResolvedValue({
      success: false,
      error: { code: ErrorCodes.NETWORK_ERROR, message: 'Failed to fetch' },
    });
    const { result } = renderHook(() => useRestApiClientHooks());
    act(() => result.current.setUrl('https://api.example.com'));

    await act(async () => {
      await result.current.handleSend();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toEqual({
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Failed to fetch',
    });
    expect(result.current.response).toBeNull();
  });

  it('passes an AbortSignal through to executeRestRequest that handleCancel aborts', async () => {
    let capturedSignal: AbortSignal | undefined;
    vi.mocked(executeRestRequest).mockImplementation((_config, signal) => {
      capturedSignal = signal;
      return new Promise(() => {});
    });
    const { result } = renderHook(() => useRestApiClientHooks());
    act(() => result.current.setUrl('https://api.example.com'));

    act(() => {
      result.current.handleSend();
    });
    expect(capturedSignal?.aborted).toBe(false);

    act(() => result.current.handleCancel());
    expect(capturedSignal?.aborted).toBe(true);
  });
});

describe('useRestApiClientHooks — handleClear', () => {
  it('resets every field back to its initial value', async () => {
    vi.mocked(executeRestRequest).mockResolvedValue({ success: true, response: sampleResponse() });
    const { result } = renderHook(() => useRestApiClientHooks());

    act(() => result.current.setMethod('POST'));
    act(() => result.current.setUrl('https://api.example.com'));
    act(() => result.current.setBody('{"a":1}'));
    act(() => result.current.addQueryParam());
    act(() => result.current.addHeader());
    act(() => result.current.setAuth({ type: 'bearer', token: 'abc' }));
    act(() => result.current.setBodyType('urlEncoded'));
    act(() => result.current.addBodyField());
    act(() => result.current.loadSavedRequest(sampleSavedRequest()));
    await act(async () => {
      await result.current.handleSend();
    });
    expect(result.current.status).toBe('success');

    act(() => result.current.handleClear());

    expect(result.current.method).toBe('GET');
    expect(result.current.url).toBe('');
    expect(result.current.body).toBe('');
    expect(result.current.queryParams).toHaveLength(1);
    expect(result.current.headers).toHaveLength(1);
    expect(result.current.auth).toEqual({ type: 'none' });
    expect(result.current.loadedRequestId).toBeNull();
    expect(result.current.bodyType).toBe('raw');
    expect(result.current.bodyFields).toHaveLength(1);
    expect(result.current.status).toBe('idle');
    expect(result.current.response).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
