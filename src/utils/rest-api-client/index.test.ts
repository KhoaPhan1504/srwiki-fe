import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorCodes, REST_CLIENT_TIMEOUT_MS } from '~root/constants';
import type { KeyValuePair, RestRequestConfig } from '~root/types';
import {
  applyVariablesToConfig,
  buildBodyFieldsFormData,
  buildBodyFieldsSearchParams,
  buildSendableHeaders,
  buildUrlWithParams,
  createEmptyKeyValuePair,
  executeRestRequest,
  formatResponseDuration,
  formatResponseSize,
  mergeVariables,
  resolveAuthEntry,
  substituteVariables,
  validateRestRequest,
} from '.';

const kv = (overrides: Partial<KeyValuePair>): KeyValuePair => ({
  id: 'id',
  key: '',
  value: '',
  enabled: true,
  ...overrides,
});

const validConfig = (overrides: Partial<RestRequestConfig> = {}): RestRequestConfig => ({
  method: 'GET',
  url: 'https://api.example.com/users',
  queryParams: [],
  headers: [],
  body: '',
  bodyType: 'raw',
  bodyFields: [],
  auth: { type: 'none' },
  ...overrides,
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('createEmptyKeyValuePair', () => {
  it('creates an enabled, empty row with a unique id', () => {
    const a = createEmptyKeyValuePair();
    const b = createEmptyKeyValuePair();
    expect(a).toMatchObject({ key: '', value: '', enabled: true });
    expect(a.id).not.toBe(b.id);
  });
});

describe('buildUrlWithParams', () => {
  it('appends enabled, non-empty params as a query string', () => {
    const url = buildUrlWithParams('https://api.example.com/users', [
      kv({ key: 'page', value: '2' }),
      kv({ key: 'limit', value: '10' }),
    ]);
    expect(url).toBe('https://api.example.com/users?page=2&limit=10');
  });

  it('skips disabled rows and rows with an empty key', () => {
    const url = buildUrlWithParams('https://api.example.com/users', [
      kv({ key: 'page', value: '2', enabled: false }),
      kv({ key: '', value: 'ignored' }),
    ]);
    expect(url).toBe('https://api.example.com/users');
  });

  it('preserves query params already present on the raw URL', () => {
    const url = buildUrlWithParams('https://api.example.com/users?sort=asc', [
      kv({ key: 'page', value: '2' }),
    ]);
    expect(url).toBe('https://api.example.com/users?sort=asc&page=2');
  });
});

describe('buildSendableHeaders', () => {
  it('builds a Headers object from enabled, non-empty rows', () => {
    const headers = buildSendableHeaders([
      kv({ key: 'X-Custom', value: 'yes' }),
      kv({ key: 'Accept', value: 'application/json' }),
    ]);
    expect(headers.get('x-custom')).toBe('yes');
    expect(headers.get('accept')).toBe('application/json');
  });

  it('skips disabled rows and rows with an empty key', () => {
    const headers = buildSendableHeaders([
      kv({ key: 'X-Skip', value: 'a', enabled: false }),
      kv({ key: '', value: 'b' }),
    ]);
    expect(Array.from(headers.keys())).toHaveLength(0);
  });

  it('strips forbidden header names regardless of case', () => {
    const headers = buildSendableHeaders([
      kv({ key: 'Cookie', value: 'a=b' }),
      kv({ key: 'HOST', value: 'evil.example.com' }),
      kv({ key: 'Content-Length', value: '0' }),
    ]);
    expect(Array.from(headers.keys())).toHaveLength(0);
  });

  it('strips headers with a Proxy- or Sec- prefix', () => {
    const headers = buildSendableHeaders([
      kv({ key: 'Sec-Fetch-Mode', value: 'cors' }),
      kv({ key: 'Proxy-Authorization', value: 'x' }),
    ]);
    expect(Array.from(headers.keys())).toHaveLength(0);
  });
});

describe('buildBodyFieldsSearchParams', () => {
  it('builds URLSearchParams from enabled, non-empty rows', () => {
    const params = buildBodyFieldsSearchParams([
      kv({ key: 'a', value: '1' }),
      kv({ key: 'b', value: '2' }),
    ]);
    expect(params.toString()).toBe('a=1&b=2');
  });

  it('skips disabled rows and rows with an empty key', () => {
    const params = buildBodyFieldsSearchParams([
      kv({ key: 'a', value: '1', enabled: false }),
      kv({ key: '', value: 'ignored' }),
    ]);
    expect(params.toString()).toBe('');
  });
});

describe('buildBodyFieldsFormData', () => {
  it('builds FormData from enabled, non-empty rows', () => {
    const formData = buildBodyFieldsFormData([
      kv({ key: 'a', value: '1' }),
      kv({ key: 'b', value: '2' }),
    ]);
    expect(Array.from(formData.entries())).toEqual([
      ['a', '1'],
      ['b', '2'],
    ]);
  });

  it('skips disabled rows and rows with an empty key', () => {
    const formData = buildBodyFieldsFormData([
      kv({ key: 'a', value: '1', enabled: false }),
      kv({ key: '', value: 'ignored' }),
    ]);
    expect(Array.from(formData.entries())).toEqual([]);
  });
});

describe('resolveAuthEntry', () => {
  it('returns null for no auth', () => {
    expect(resolveAuthEntry({ type: 'none' })).toBeNull();
  });

  it('returns a trimmed Bearer Authorization header', () => {
    const entry = resolveAuthEntry({ type: 'bearer', token: '  abc123  ' });
    expect(entry).toEqual({ header: { key: 'Authorization', value: 'Bearer abc123' } });
  });

  it('returns null for a blank bearer token', () => {
    expect(resolveAuthEntry({ type: 'bearer', token: '   ' })).toBeNull();
  });

  it('returns a Basic Authorization header from username and password', () => {
    const entry = resolveAuthEntry({ type: 'basic', username: 'alice', password: 'secret' });
    expect(entry).toEqual({
      header: { key: 'Authorization', value: `Basic ${btoa('alice:secret')}` },
    });
  });

  it('returns null for basic auth with no username or password', () => {
    expect(resolveAuthEntry({ type: 'basic', username: '', password: '' })).toBeNull();
  });

  it('returns an API key as a header when addTo is header', () => {
    const entry = resolveAuthEntry({
      type: 'apiKey',
      key: 'X-Api-Key',
      value: 'k1',
      addTo: 'header',
    });
    expect(entry).toEqual({ header: { key: 'X-Api-Key', value: 'k1' } });
  });

  it('returns an API key as a query param when addTo is query', () => {
    const entry = resolveAuthEntry({ type: 'apiKey', key: 'api_key', value: 'k1', addTo: 'query' });
    expect(entry).toEqual({ query: { key: 'api_key', value: 'k1' } });
  });

  it('returns null for an API key with a blank key name', () => {
    const entry = resolveAuthEntry({ type: 'apiKey', key: '  ', value: 'k1', addTo: 'header' });
    expect(entry).toBeNull();
  });
});

describe('validateRestRequest', () => {
  it('returns EMPTY_INPUT for a blank URL', () => {
    expect(validateRestRequest(validConfig({ url: '' }))).toEqual({
      code: ErrorCodes.EMPTY_INPUT,
      message: '',
    });
  });

  it('returns INVALID_URL for a malformed URL', () => {
    const result = validateRestRequest(validConfig({ url: 'not-a-url' }));
    expect(result?.code).toBe(ErrorCodes.INVALID_URL);
  });

  it('returns INVALID_URL for a non-http(s) protocol', () => {
    const result = validateRestRequest(validConfig({ url: 'ftp://example.com/file' }));
    expect(result?.code).toBe(ErrorCodes.INVALID_URL);
  });

  it('returns INVALID_HEADER_KEY for a header name with invalid characters', () => {
    const result = validateRestRequest(
      validConfig({ headers: [kv({ key: 'X Bad Header:', value: 'x' })] }),
    );
    expect(result?.code).toBe(ErrorCodes.INVALID_HEADER_KEY);
  });

  it('ignores disabled headers when validating header names', () => {
    const result = validateRestRequest(
      validConfig({ headers: [kv({ key: 'X Bad Header:', value: 'x', enabled: false })] }),
    );
    expect(result).toBeNull();
  });

  it('returns INVALID_JSON_BODY for malformed JSON on a body-carrying method', () => {
    const result = validateRestRequest(validConfig({ method: 'POST', body: '{not json' }));
    expect(result?.code).toBe(ErrorCodes.INVALID_JSON_BODY);
  });

  it('ignores an invalid body on methods that do not take one', () => {
    const result = validateRestRequest(validConfig({ method: 'GET', body: '{not json' }));
    expect(result).toBeNull();
  });

  it('does not validate JSON when bodyType is urlEncoded, even with body-shaped text', () => {
    const result = validateRestRequest(
      validConfig({ method: 'POST', bodyType: 'urlEncoded', body: '{not json' }),
    );
    expect(result).toBeNull();
  });

  it('does not validate JSON when bodyType is formData', () => {
    const result = validateRestRequest(
      validConfig({ method: 'POST', bodyType: 'formData', body: '{not json' }),
    );
    expect(result).toBeNull();
  });

  it('returns null for a fully valid request', () => {
    const result = validateRestRequest(
      validConfig({ method: 'POST', body: '{"a":1}', headers: [kv({ key: 'X-Ok', value: '1' })] }),
    );
    expect(result).toBeNull();
  });
});

describe('executeRestRequest', () => {
  it('does not call fetch when the request fails validation', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await executeRestRequest(validConfig({ url: 'not-a-url' }));

    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normalizes a successful JSON response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );

    const result = await executeRestRequest(validConfig());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.response.status).toBe(200);
      expect(result.response.ok).toBe(true);
      expect(result.response.body).toEqual({
        isJson: true,
        json: { ok: true },
        text: '{"ok":true}',
      });
      expect(result.response.durationMs).toBeGreaterThanOrEqual(0);
    }
  });

  it('normalizes a plain-text response', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('hello world', { status: 200, headers: { 'content-type': 'text/plain' } }),
        ),
    );

    const result = await executeRestRequest(validConfig());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.response.body).toEqual({ isJson: false, text: 'hello world' });
    }
  });

  it('treats a 404 response as a successful HTTP exchange, not a transport failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response('Not found', { status: 404, statusText: 'Not Found' })),
    );

    const result = await executeRestRequest(validConfig());

    expect(result).toMatchObject({ success: true, response: { status: 404, ok: false } });
  });

  it('returns NETWORK_ERROR when fetch rejects with a connection failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const result = await executeRestRequest(validConfig());

    expect(result).toEqual({
      success: false,
      error: { code: ErrorCodes.NETWORK_ERROR, message: 'Failed to fetch' },
    });
  });

  it('returns REQUEST_ABORTED when the caller cancels the request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }),
      ),
    );
    const controller = new AbortController();

    const resultPromise = executeRestRequest(validConfig(), controller.signal);
    controller.abort();
    const result = await resultPromise;

    expect(result).toEqual({
      success: false,
      error: { code: ErrorCodes.REQUEST_ABORTED, message: 'Request was cancelled' },
    });
  });

  it('returns REQUEST_TIMEOUT when the server never responds', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }),
      ),
    );

    const resultPromise = executeRestRequest(validConfig());
    await vi.advanceTimersByTimeAsync(REST_CLIENT_TIMEOUT_MS);
    const result = await resultPromise;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.REQUEST_TIMEOUT);
    }
  });

  it('omits the body for methods that do not take one', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await executeRestRequest(validConfig({ method: 'GET', body: '{"a":1}' }));

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBeUndefined();
  });

  it('defaults Content-Type to application/json when a body is sent without one', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await executeRestRequest(validConfig({ method: 'POST', body: '{"a":1}' }));

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get('content-type')).toBe('application/json');
    expect(init.body).toBe('{"a":1}');
  });

  it('does not forward forbidden headers to fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await executeRestRequest(validConfig({ headers: [kv({ key: 'Host', value: 'evil.com' })] }));

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).has('host')).toBe(false);
  });

  it('applies bearer auth as an Authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await executeRestRequest(validConfig({ auth: { type: 'bearer', token: 'abc123' } }));

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get('authorization')).toBe('Bearer abc123');
  });

  it('lets auth-tab credentials override a manually entered Authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await executeRestRequest(
      validConfig({
        headers: [kv({ key: 'Authorization', value: 'raw-token-without-bearer' })],
        auth: { type: 'bearer', token: 'abc123' },
      }),
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get('authorization')).toBe('Bearer abc123');
  });

  it('adds API key auth as a query parameter when addTo is query', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await executeRestRequest(
      validConfig({ auth: { type: 'apiKey', key: 'api_key', value: 'k1', addTo: 'query' } }),
    );

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.example.com/users?api_key=k1');
  });

  it('sends a URL-encoded body and defaults its Content-Type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await executeRestRequest(
      validConfig({
        method: 'POST',
        bodyType: 'urlEncoded',
        bodyFields: [kv({ key: 'a', value: '1' })],
      }),
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get('content-type')).toBe('application/x-www-form-urlencoded');
    expect(init.body).toBeInstanceOf(URLSearchParams);
    expect((init.body as URLSearchParams).toString()).toBe('a=1');
  });

  it('sends a form-data body and strips any manually set Content-Type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await executeRestRequest(
      validConfig({
        method: 'POST',
        bodyType: 'formData',
        bodyFields: [kv({ key: 'a', value: '1' })],
        headers: [kv({ key: 'Content-Type', value: 'multipart/form-data' })],
      }),
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).has('content-type')).toBe(false);
    expect(init.body).toBeInstanceOf(FormData);
    expect(Array.from((init.body as FormData).entries())).toEqual([['a', '1']]);
  });

  it('omits the body for urlEncoded/formData when no fields are enabled', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await executeRestRequest(
      validConfig({ method: 'POST', bodyType: 'urlEncoded', bodyFields: [] }),
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBeUndefined();
  });
});

describe('formatResponseDuration', () => {
  it('formats sub-second durations in milliseconds', () => {
    expect(formatResponseDuration(0)).toBe('0 ms');
    expect(formatResponseDuration(42.6)).toBe('43 ms');
    expect(formatResponseDuration(999)).toBe('999 ms');
  });

  it('formats durations of a second or more in seconds', () => {
    expect(formatResponseDuration(1000)).toBe('1.00 s');
    expect(formatResponseDuration(1234)).toBe('1.23 s');
  });
});

describe('formatResponseSize', () => {
  it('formats sub-1024-byte sizes in bytes', () => {
    expect(formatResponseSize(0)).toBe('0 B');
    expect(formatResponseSize(512)).toBe('512 B');
  });

  it('formats kilobyte-range sizes in KB', () => {
    expect(formatResponseSize(1024)).toBe('1.0 KB');
    expect(formatResponseSize(2048)).toBe('2.0 KB');
  });

  it('formats megabyte-range sizes in MB', () => {
    expect(formatResponseSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatResponseSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('mergeVariables', () => {
  it('combines global and environment variables', () => {
    const merged = mergeVariables(
      [kv({ key: 'base_url', value: 'https://global.api' })],
      [kv({ key: 'token', value: 'env-token' })],
    );
    expect(merged.map((v) => v.key).sort()).toEqual(['base_url', 'token']);
  });

  it('lets the environment variable win when keys collide', () => {
    const merged = mergeVariables(
      [kv({ key: 'base_url', value: 'https://global.api' })],
      [kv({ key: 'base_url', value: 'https://env.api' })],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].value).toBe('https://env.api');
  });

  it('ignores disabled and blank-key variables from both sides', () => {
    const merged = mergeVariables(
      [kv({ key: 'a', value: '1', enabled: false }), kv({ key: '', value: 'x' })],
      [kv({ key: 'b', value: '2', enabled: false })],
    );
    expect(merged).toHaveLength(0);
  });
});

describe('substituteVariables', () => {
  it('replaces a matching variable', () => {
    expect(
      substituteVariables('{{base_url}}/users', [
        kv({ key: 'base_url', value: 'https://api.example.com' }),
      ]),
    ).toBe('https://api.example.com/users');
  });

  it('leaves unmatched variables as literal text', () => {
    expect(substituteVariables('{{unknown}}/users', [])).toBe('{{unknown}}/users');
  });

  it('replaces multiple variables in one string', () => {
    const variables = [
      kv({ key: 'host', value: 'api.example.com' }),
      kv({ key: 'id', value: '42' }),
    ];
    expect(substituteVariables('https://{{host}}/users/{{id}}', variables)).toBe(
      'https://api.example.com/users/42',
    );
  });

  it('tolerates whitespace inside the braces', () => {
    expect(
      substituteVariables('{{ base_url }}', [
        kv({ key: 'base_url', value: 'https://api.example.com' }),
      ]),
    ).toBe('https://api.example.com');
  });
});

describe('applyVariablesToConfig', () => {
  it('returns the config unchanged when there are no variables', () => {
    const config = validConfig({ url: '{{base_url}}/users' });
    expect(applyVariablesToConfig(config, [])).toEqual(config);
  });

  it('substitutes in the URL, query params, headers, and body', () => {
    const variables = [
      kv({ key: 'base_url', value: 'https://api.example.com' }),
      kv({ key: 'page', value: '2' }),
    ];
    const config = validConfig({
      url: '{{base_url}}/users',
      queryParams: [kv({ key: 'page', value: '{{page}}' })],
      headers: [kv({ key: 'X-{{page}}', value: 'v' })],
      body: '{"page": "{{page}}"}',
    });

    const result = applyVariablesToConfig(config, variables);

    expect(result.url).toBe('https://api.example.com/users');
    expect(result.queryParams[0].value).toBe('2');
    expect(result.headers[0].key).toBe('X-2');
    expect(result.body).toBe('{"page": "2"}');
  });

  it('substitutes in bodyFields for urlEncoded/formData bodies', () => {
    const variables = [kv({ key: 'name', value: 'alice' })];
    const config = validConfig({
      bodyType: 'formData',
      bodyFields: [kv({ key: 'user', value: '{{name}}' })],
    });

    const result = applyVariablesToConfig(config, variables);

    expect(result.bodyFields[0].value).toBe('alice');
  });

  it('substitutes in bearer/basic/apiKey auth fields', () => {
    const variables = [kv({ key: 'token', value: 'secret' })];

    expect(
      applyVariablesToConfig(
        validConfig({ auth: { type: 'bearer', token: '{{token}}' } }),
        variables,
      ).auth,
    ).toEqual({ type: 'bearer', token: 'secret' });

    expect(
      applyVariablesToConfig(
        validConfig({ auth: { type: 'basic', username: '{{token}}', password: 'p' } }),
        variables,
      ).auth,
    ).toEqual({ type: 'basic', username: 'secret', password: 'p' });

    expect(
      applyVariablesToConfig(
        validConfig({
          auth: { type: 'apiKey', key: 'X-Key', value: '{{token}}', addTo: 'header' },
        }),
        variables,
      ).auth,
    ).toEqual({ type: 'apiKey', key: 'X-Key', value: 'secret', addTo: 'header' });
  });
});
