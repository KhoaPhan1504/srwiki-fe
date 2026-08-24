import { describe, expect, it } from 'vitest';
import { filterHeadersByName, formatHeadersRaw, sortHeaders } from '.';
import type { HeaderEntry } from '~root/types';

describe('sortHeaders', () => {
  it('handles an empty array', () => {
    const result = sortHeaders([]);
    expect(result).toEqual([]);
  });

  it('sorts headers spanning multiple important categories in the fixed order', () => {
    const headers: HeaderEntry[] = [
      { name: 'X-Custom-Header', value: 'custom' },
      { name: 'Server', value: 'nginx' },
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Cache-Control', value: 'no-cache' },
      { name: 'Access-Control-Allow-Origin', value: '*' },
      { name: 'Strict-Transport-Security', value: 'max-age=31536000' },
      { name: 'Another-Unknown', value: 'value' },
      { name: 'Content-Length', value: '1234' },
    ];

    const result = sortHeaders(headers);

    // Expected order: Content (Content-Type, Content-Length) -> Caching (Cache-Control) ->
    // CORS (Access-Control-Allow-Origin) -> Security (Strict-Transport-Security) ->
    // Server (Server) -> Unknown alphabetical (Another-Unknown, X-Custom-Header)
    expect(result).toEqual([
      { name: 'Content-Length', value: '1234' },
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Cache-Control', value: 'no-cache' },
      { name: 'Access-Control-Allow-Origin', value: '*' },
      { name: 'Strict-Transport-Security', value: 'max-age=31536000' },
      { name: 'Server', value: 'nginx' },
      { name: 'Another-Unknown', value: 'value' },
      { name: 'X-Custom-Header', value: 'custom' },
    ]);
  });

  it('handles mixed case header names (case-insensitive category matching)', () => {
    const headers: HeaderEntry[] = [
      { name: 'content-TYPE', value: 'text/html' },
      { name: 'CONTENT-LENGTH', value: '512' },
      { name: 'Cache-Control', value: 'max-age=3600' },
      { name: 'x-unknown', value: 'test' },
    ];

    const result = sortHeaders(headers);

    // Content headers should be grouped first (alphabetical within), then caching, then unknown.
    expect(result[0].name.toLowerCase()).toBe('content-length');
    expect(result[1].name.toLowerCase()).toBe('content-type');
    expect(result[2].name.toLowerCase()).toBe('cache-control');
    expect(result[3].name).toBe('x-unknown');
  });

  it('sorts unknown headers alphabetically within their block', () => {
    const headers: HeaderEntry[] = [
      { name: 'Zebra-Header', value: '1' },
      { name: 'Alpha-Header', value: '2' },
      { name: 'Content-Type', value: 'text/plain' },
      { name: 'Bravo-Header', value: '3' },
    ];

    const result = sortHeaders(headers);

    // Content first, then unknown headers in alphabetical order.
    expect(result).toEqual([
      { name: 'Content-Type', value: 'text/plain' },
      { name: 'Alpha-Header', value: '2' },
      { name: 'Bravo-Header', value: '3' },
      { name: 'Zebra-Header', value: '1' },
    ]);
  });

  it('sorts important headers alphabetically within each category', () => {
    const headers: HeaderEntry[] = [
      { name: 'Content-Length', value: '100' },
      { name: 'Content-Encoding', value: 'gzip' },
      { name: 'Content-Type', value: 'text/html' },
      { name: 'ETag', value: '"abc123"' },
      { name: 'Cache-Control', value: 'no-cache' },
    ];

    const result = sortHeaders(headers);

    // Content category: Content-Encoding, Content-Length, Content-Type (alphabetical)
    // Caching category: Cache-Control, ETag (alphabetical)
    expect(result).toEqual([
      { name: 'Content-Encoding', value: 'gzip' },
      { name: 'Content-Length', value: '100' },
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Cache-Control', value: 'no-cache' },
      { name: 'ETag', value: '"abc123"' },
    ]);
  });

  it('does not mutate the input array', () => {
    const headers: HeaderEntry[] = [
      { name: 'Server', value: 'nginx' },
      { name: 'Content-Type', value: 'application/json' },
    ];
    const originalHeaders = [...headers];

    sortHeaders(headers);

    expect(headers).toEqual(originalHeaders);
  });

  it('returns a new array reference', () => {
    const headers: HeaderEntry[] = [{ name: 'Content-Type', value: 'text/html' }];
    const result = sortHeaders(headers);

    expect(result).not.toBe(headers);
  });

  it('handles all five category types', () => {
    const headers: HeaderEntry[] = [
      // Server category
      { name: 'Date', value: 'Mon, 21 Aug 2026 00:00:00 GMT' },
      // Security category
      { name: 'Content-Security-Policy', value: "default-src 'self'" },
      // CORS category
      { name: 'Access-Control-Allow-Methods', value: 'GET, POST' },
      // Caching category
      { name: 'Last-Modified', value: 'Sun, 20 Aug 2026 00:00:00 GMT' },
      // Content category
      { name: 'Content-Type', value: 'application/json' },
    ];

    const result = sortHeaders(headers);

    // Verify order matches IMPORTANT_HEADER_CATEGORY_ORDER
    const resultLowerNames = result.map((h) => h.name.toLowerCase());

    // Content-Type should be first
    expect(resultLowerNames[0]).toBe('content-type');
    // Last-Modified should be second
    expect(resultLowerNames[1]).toBe('last-modified');
    // Access-Control-Allow-Methods third
    expect(resultLowerNames[2]).toBe('access-control-allow-methods');
    // Content-Security-Policy fourth
    expect(resultLowerNames[3]).toBe('content-security-policy');
    // Date should be fifth
    expect(resultLowerNames[4]).toBe('date');
  });
});

describe('filterHeadersByName', () => {
  it('returns all headers when query is empty', () => {
    const headers: HeaderEntry[] = [
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Server', value: 'nginx' },
    ];

    const result = filterHeadersByName(headers, '');

    expect(result).toEqual(headers);
  });

  it('returns all headers when query is whitespace-only', () => {
    const headers: HeaderEntry[] = [
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Server', value: 'nginx' },
    ];

    const result = filterHeadersByName(headers, '   ');

    expect(result).toEqual(headers);
  });

  it('performs case-insensitive substring match against header name', () => {
    const headers: HeaderEntry[] = [
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Content-Length', value: '1234' },
      { name: 'Server', value: 'nginx' },
    ];

    const result = filterHeadersByName(headers, 'CONTENT');

    expect(result).toEqual([
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Content-Length', value: '1234' },
    ]);
  });

  it('returns an empty array when query matches nothing', () => {
    const headers: HeaderEntry[] = [
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Server', value: 'nginx' },
    ];

    const result = filterHeadersByName(headers, 'NonExistent');

    expect(result).toEqual([]);
  });

  it('matches substring in the header name but ignores value', () => {
    const headers: HeaderEntry[] = [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'X-Custom-Application', value: 'some-value' },
      { name: 'Server', value: 'application' },
    ];

    const result = filterHeadersByName(headers, 'application');

    // Should match headers where "application" appears in the NAME only.
    expect(result).toEqual([{ name: 'X-Custom-Application', value: 'some-value' }]);
  });

  it('does not match substring in value when not in name', () => {
    const headers: HeaderEntry[] = [
      { name: 'Server', value: 'Apache' },
      { name: 'Date', value: 'Mon, 21 Aug 2026 00:00:00 GMT' },
    ];

    const result = filterHeadersByName(headers, 'Apache');

    expect(result).toEqual([]);
  });

  it('preserves original header order in results', () => {
    const headers: HeaderEntry[] = [
      { name: 'Server', value: 'nginx' },
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Cache-Control', value: 'no-cache' },
      { name: 'Content-Length', value: '512' },
    ];

    const result = filterHeadersByName(headers, 'content');

    expect(result).toEqual([
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Content-Length', value: '512' },
    ]);
  });

  it('handles partial substring matches', () => {
    const headers: HeaderEntry[] = [
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Content-Length', value: '1234' },
      { name: 'Content-Encoding', value: 'gzip' },
    ];

    const result = filterHeadersByName(headers, 'tent-');

    expect(result).toEqual([
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Content-Length', value: '1234' },
      { name: 'Content-Encoding', value: 'gzip' },
    ]);
  });

  it('returns all headers from an empty array', () => {
    const headers: HeaderEntry[] = [];

    const result = filterHeadersByName(headers, 'anything');

    expect(result).toEqual([]);
  });
});

describe('formatHeadersRaw', () => {
  it('formats a single header correctly', () => {
    const headers: HeaderEntry[] = [{ name: 'Content-Type', value: 'text/html' }];

    const result = formatHeadersRaw(headers);

    expect(result).toBe('Content-Type: text/html');
  });

  it('formats multiple headers with newline separation', () => {
    const headers: HeaderEntry[] = [
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Content-Length', value: '1234' },
      { name: 'Server', value: 'nginx' },
    ];

    const result = formatHeadersRaw(headers);

    expect(result).toBe('Content-Type: text/html\nContent-Length: 1234\nServer: nginx');
  });

  it('returns an empty string for an empty array', () => {
    const headers: HeaderEntry[] = [];

    const result = formatHeadersRaw(headers);

    expect(result).toBe('');
  });

  it('preserves the input order (does not reorder)', () => {
    const headers: HeaderEntry[] = [
      { name: 'Server', value: 'nginx' },
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Date', value: 'Mon, 21 Aug 2026 00:00:00 GMT' },
    ];

    const result = formatHeadersRaw(headers);

    expect(result).toBe(
      'Server: nginx\nContent-Type: text/html\nDate: Mon, 21 Aug 2026 00:00:00 GMT',
    );
  });

  it('handles headers with special characters in values', () => {
    const headers: HeaderEntry[] = [
      { name: 'Content-Security-Policy', value: "default-src 'self'; script-src 'unsafe-inline'" },
      { name: 'X-Custom-Header', value: 'value with spaces and: colons' },
    ];

    const result = formatHeadersRaw(headers);

    expect(result).toBe(
      "Content-Security-Policy: default-src 'self'; script-src 'unsafe-inline'\nX-Custom-Header: value with spaces and: colons",
    );
  });

  it('does not call sortHeaders internally (preserves caller order)', () => {
    const unsortedHeaders: HeaderEntry[] = [
      { name: 'Server', value: 'nginx' },
      { name: 'Content-Type', value: 'text/html' },
    ];

    const result = formatHeadersRaw(unsortedHeaders);

    // If it were sorting, Content-Type would come first.
    // But it should preserve the input order (Server first).
    expect(result).toBe('Server: nginx\nContent-Type: text/html');
  });

  it('formats headers with empty values', () => {
    const headers: HeaderEntry[] = [
      { name: 'X-Empty-Header', value: '' },
      { name: 'Content-Type', value: 'text/html' },
    ];

    const result = formatHeadersRaw(headers);

    expect(result).toBe('X-Empty-Header: \nContent-Type: text/html');
  });
});
