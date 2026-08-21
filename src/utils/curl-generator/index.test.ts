import { describe, expect, it } from 'vitest';
import { ErrorCodes } from '~root/constants';
import type { CurlRequestConfig, KeyValuePair } from '~root/types';
import { generateCurlCommand, validateCurlRequest } from '.';

const kv = (overrides: Partial<KeyValuePair>): KeyValuePair => ({
  id: 'id',
  key: '',
  value: '',
  enabled: true,
  ...overrides,
});

const baseConfig = (overrides: Partial<CurlRequestConfig> = {}): CurlRequestConfig => ({
  method: 'GET',
  url: 'https://api.example.com/users',
  queryParams: [],
  headers: [],
  body: '',
  ...overrides,
});

describe('validateCurlRequest', () => {
  it('returns EMPTY_INPUT for an empty URL', () => {
    expect(validateCurlRequest(baseConfig({ url: '' }))).toEqual({
      code: ErrorCodes.EMPTY_INPUT,
      message: '',
    });
  });

  it('returns EMPTY_INPUT for a whitespace-only URL', () => {
    expect(validateCurlRequest(baseConfig({ url: '   ' }))?.code).toBe(ErrorCodes.EMPTY_INPUT);
  });

  it('returns INVALID_URL for an unparsable URL', () => {
    expect(validateCurlRequest(baseConfig({ url: 'not-a-url' }))?.code).toBe(
      ErrorCodes.INVALID_URL,
    );
  });

  it('returns INVALID_URL for a non-http(s) protocol', () => {
    expect(validateCurlRequest(baseConfig({ url: 'ftp://example.com/file' }))?.code).toBe(
      ErrorCodes.INVALID_URL,
    );
  });

  it('returns INVALID_HEADER_KEY for an enabled header with an invalid name', () => {
    const config = baseConfig({ headers: [kv({ key: 'Invalid Header', value: 'x' })] });
    expect(validateCurlRequest(config)?.code).toBe(ErrorCodes.INVALID_HEADER_KEY);
  });

  it('ignores a disabled header with an invalid name', () => {
    const config = baseConfig({
      headers: [kv({ key: 'Invalid Header', value: 'x', enabled: false })],
    });
    expect(validateCurlRequest(config)).toBeNull();
  });

  it('ignores a header with an empty key', () => {
    const config = baseConfig({ headers: [kv({ key: '', value: 'x' })] });
    expect(validateCurlRequest(config)).toBeNull();
  });

  it('returns null for a fully valid config', () => {
    expect(validateCurlRequest(baseConfig())).toBeNull();
  });
});

describe('generateCurlCommand — validation short-circuit', () => {
  it('returns a failure result instead of a command when validation fails', () => {
    const result = generateCurlCommand(baseConfig({ url: '' }), 'singleLine');
    expect(result).toEqual({
      success: false,
      error: { code: ErrorCodes.EMPTY_INPUT, message: '' },
    });
  });
});

describe('generateCurlCommand — basic requests (single-line)', () => {
  it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const)(
    'generates an explicit -X flag for %s',
    (method) => {
      const result = generateCurlCommand(baseConfig({ method }), 'singleLine');
      expect(result).toEqual({
        success: true,
        command: `curl -X ${method} 'https://api.example.com/users'`,
      });
    },
  );
});

describe('generateCurlCommand — URL handling', () => {
  it('quotes a bare URL with no query params', () => {
    const result = generateCurlCommand(baseConfig({ url: 'https://example.com/a' }), 'singleLine');
    expect(result).toEqual({ success: true, command: "curl -X GET 'https://example.com/a'" });
  });

  it('preserves an existing query string on the URL', () => {
    const result = generateCurlCommand(
      baseConfig({ url: 'https://example.com/a?existing=1' }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X GET 'https://example.com/a?existing=1'",
    });
  });

  it('merges additional query params onto an existing query string', () => {
    const result = generateCurlCommand(
      baseConfig({
        url: 'https://example.com/a?existing=1',
        queryParams: [kv({ key: 'page', value: '2' }), kv({ key: 'limit', value: '10' })],
      }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X GET 'https://example.com/a?existing=1&page=2&limit=10'",
    });
  });

  it('percent-encodes spaces and unicode in query param values', () => {
    const result = generateCurlCommand(
      baseConfig({
        queryParams: [kv({ key: 'q', value: 'hello world 日本語' })],
      }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command:
        "curl -X GET 'https://api.example.com/users?q=hello+world+%E6%97%A5%E6%9C%AC%E8%AA%9E'",
    });
  });

  it('percent-encodes reserved characters (&, ?, =) in query param values', () => {
    const result = generateCurlCommand(
      baseConfig({ queryParams: [kv({ key: 'q', value: 'a&b=c?d' })] }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users?q=a%26b%3Dc%3Fd'",
    });
  });

  it('skips disabled or empty-key query param rows', () => {
    const result = generateCurlCommand(
      baseConfig({
        queryParams: [
          kv({ key: 'kept', value: '1' }),
          kv({ key: 'skip-disabled', value: '2', enabled: false }),
          kv({ key: '', value: '3' }),
        ],
      }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users?kept=1'",
    });
  });

  it('keeps a URL fragment after the query string', () => {
    const result = generateCurlCommand(
      baseConfig({
        url: 'https://example.com/a#section',
        queryParams: [kv({ key: 'page', value: '2' })],
      }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X GET 'https://example.com/a?page=2#section'",
    });
  });
});

describe('generateCurlCommand — headers', () => {
  it('generates a single -H flag', () => {
    const result = generateCurlCommand(
      baseConfig({ headers: [kv({ key: 'Content-Type', value: 'application/json' })] }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users' -H 'Content-Type: application/json'",
    });
  });

  it('generates multiple -H flags in the given array order', () => {
    const result = generateCurlCommand(
      baseConfig({
        headers: [
          kv({ key: 'Authorization', value: 'Bearer token' }),
          kv({ key: 'X-Api-Key', value: 'abc123' }),
        ],
      }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command:
        "curl -X GET 'https://api.example.com/users' -H 'Authorization: Bearer token' -H 'X-Api-Key: abc123'",
    });
  });

  it('shell-escapes special characters in a header value', () => {
    const result = generateCurlCommand(
      baseConfig({ headers: [kv({ key: 'X-Note', value: `it's "quoted" $HOME` })] }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users' -H 'X-Note: it'\\''s \"quoted\" $HOME'",
    });
  });

  it('skips disabled headers', () => {
    const result = generateCurlCommand(
      baseConfig({ headers: [kv({ key: 'X-Skip', value: '1', enabled: false })] }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users'",
    });
  });

  it('skips headers with an empty key but keeps an empty value', () => {
    const result = generateCurlCommand(
      baseConfig({
        headers: [kv({ key: '', value: 'ignored' }), kv({ key: 'X-Empty', value: '' })],
      }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users' -H 'X-Empty: '",
    });
  });
});

describe('generateCurlCommand — body', () => {
  it('generates -d for a POST with a JSON body', () => {
    const result = generateCurlCommand(
      baseConfig({ method: 'POST', body: '{"name":"John","age":30}' }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: 'curl -X POST \'https://api.example.com/users\' -d \'{"name":"John","age":30}\'',
    });
  });

  it('preserves a multiline JSON body verbatim inside the quoted argument', () => {
    const body = '{\n  "name": "John",\n  "age": 30\n}';
    const result = generateCurlCommand(baseConfig({ method: 'POST', body }), 'singleLine');
    expect(result.success).toBe(true);
    expect(result.success && result.command).toContain(`-d '${body}'`);
  });

  it('shell-escapes single quotes inside the body', () => {
    const result = generateCurlCommand(
      baseConfig({ method: 'POST', body: `{"note":"it's fine"}` }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X POST 'https://api.example.com/users' -d '{\"note\":\"it'\\''s fine\"}'",
    });
  });

  it('does not generate -d for an empty body on a method that accepts one', () => {
    const result = generateCurlCommand(baseConfig({ method: 'POST', body: '' }), 'singleLine');
    expect(result).toEqual({
      success: true,
      command: "curl -X POST 'https://api.example.com/users'",
    });
  });

  it('does not generate -d for a whitespace-only body', () => {
    const result = generateCurlCommand(baseConfig({ method: 'POST', body: '   ' }), 'singleLine');
    expect(result).toEqual({
      success: true,
      command: "curl -X POST 'https://api.example.com/users'",
    });
  });

  it('ignores a body set on GET — no -d is generated', () => {
    const result = generateCurlCommand(
      baseConfig({ method: 'GET', body: '{"should":"be ignored"}' }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users'",
    });
  });

  it('generates -d for a non-JSON raw body without any error', () => {
    const result = generateCurlCommand(
      baseConfig({ method: 'POST', body: 'not json at all, just plain text' }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X POST 'https://api.example.com/users' -d 'not json at all, just plain text'",
    });
  });

  it('generates -d for a DELETE with a body', () => {
    const result = generateCurlCommand(
      baseConfig({ method: 'DELETE', body: '{"ids":[1,2,3]}' }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X DELETE 'https://api.example.com/users' -d '{\"ids\":[1,2,3]}'",
    });
  });
});

describe('generateCurlCommand — argument ordering', () => {
  it('always orders -X, then -H flags, then -d', () => {
    const result = generateCurlCommand(
      baseConfig({
        method: 'POST',
        headers: [kv({ key: 'X-One', value: '1' }), kv({ key: 'X-Two', value: '2' })],
        body: '{}',
      }),
      'singleLine',
    );
    expect(result).toEqual({
      success: true,
      command: "curl -X POST 'https://api.example.com/users' -H 'X-One: 1' -H 'X-Two: 2' -d '{}'",
    });
  });
});

describe('generateCurlCommand — multi-line formatting', () => {
  it('renders the minimal case as a single line with no trailing backslash', () => {
    const result = generateCurlCommand(baseConfig(), 'multiLine');
    expect(result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users'",
    });
  });

  it('puts each flag on its own indented line with line continuations', () => {
    const result = generateCurlCommand(
      baseConfig({
        method: 'POST',
        headers: [
          kv({ key: 'Content-Type', value: 'application/json' }),
          kv({ key: 'Authorization', value: 'Bearer token' }),
        ],
        body: '{"name":"John"}',
      }),
      'multiLine',
    );
    expect(result).toEqual({
      success: true,
      command: [
        "curl -X POST 'https://api.example.com/users' \\",
        "  -H 'Content-Type: application/json' \\",
        "  -H 'Authorization: Bearer token' \\",
        '  -d \'{"name":"John"}\'',
      ].join('\n'),
    });
  });

  it('has no trailing backslash on the last line when there is no body', () => {
    const result = generateCurlCommand(
      baseConfig({ headers: [kv({ key: 'X-Api-Key', value: 'abc123' })] }),
      'multiLine',
    );
    expect(result).toEqual({
      success: true,
      command: ["curl -X GET 'https://api.example.com/users' \\", "  -H 'X-Api-Key: abc123'"].join(
        '\n',
      ),
    });
  });
});
