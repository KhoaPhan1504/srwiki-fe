import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorCodes } from '~root/constants';
import { useCurlGeneratorHooks } from '.';

describe('useCurlGeneratorHooks', () => {
  it('starts with GET, empty url, one empty query param row, one empty header row, empty body, single-line format, and no result', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    expect(result.current.method).toBe('GET');
    expect(result.current.url).toBe('');
    expect(result.current.queryParams).toHaveLength(1);
    expect(result.current.queryParams[0]).toMatchObject({ key: '', value: '', enabled: true });
    expect(result.current.headers).toHaveLength(1);
    expect(result.current.headers[0]).toMatchObject({ key: '', value: '', enabled: true });
    expect(result.current.body).toBe('');
    expect(result.current.format).toBe('singleLine');
    expect(result.current.result).toBeNull();
  });

  it('treats an empty URL as no result rather than an EMPTY_INPUT error', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('   '));
    expect(result.current.result).toBeNull();
  });

  it('generates a command live once a valid URL is typed', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('https://api.example.com/users'));
    expect(result.current.result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users'",
    });
  });

  it('recovers to null once the URL is cleared back to empty after being valid', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('https://api.example.com/users'));
    act(() => result.current.setUrl(''));
    expect(result.current.result).toBeNull();
  });

  it('reports INVALID_URL for a malformed URL', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('not-a-url'));
    expect(result.current.result).toEqual({
      success: false,
      error: { code: ErrorCodes.INVALID_URL, message: expect.any(String) },
    });
  });

  it('recomputes the command when the method changes', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('https://api.example.com/users'));
    act(() => result.current.setMethod('POST'));
    expect(result.current.method).toBe('POST');
    expect(result.current.result).toEqual({
      success: true,
      command: "curl -X POST 'https://api.example.com/users'",
    });
  });

  it('adds a new empty query param row', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.addQueryParam());
    expect(result.current.queryParams).toHaveLength(2);
  });

  it('updating a query param row recomputes the command URL', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('https://api.example.com/users'));
    const rowId = result.current.queryParams[0].id;
    act(() => result.current.updateQueryParam(rowId, { key: 'page', value: '2' }));
    expect(result.current.result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users?page=2'",
    });
  });

  it('removing a query param row drops it from the generated URL', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('https://api.example.com/users'));
    const firstRowId = result.current.queryParams[0].id;
    act(() => result.current.updateQueryParam(firstRowId, { key: 'page', value: '2' }));
    act(() => result.current.addQueryParam());
    const secondRowId = result.current.queryParams[1].id;
    act(() => result.current.updateQueryParam(secondRowId, { key: 'limit', value: '10' }));
    act(() => result.current.removeQueryParam(firstRowId));
    expect(result.current.queryParams).toHaveLength(1);
    expect(result.current.result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users?limit=10'",
    });
  });

  it('adds a new empty header row', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.addHeader());
    expect(result.current.headers).toHaveLength(2);
  });

  it('updating a header row recomputes the command with the new -H flag', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('https://api.example.com/users'));
    const rowId = result.current.headers[0].id;
    act(() =>
      result.current.updateHeader(rowId, { key: 'Content-Type', value: 'application/json' }),
    );
    expect(result.current.result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users' -H 'Content-Type: application/json'",
    });
  });

  it('removing a header row drops its -H flag', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('https://api.example.com/users'));
    const rowId = result.current.headers[0].id;
    act(() => result.current.updateHeader(rowId, { key: 'X-Api-Key', value: 'abc123' }));
    act(() => result.current.removeHeader(rowId));
    expect(result.current.headers).toHaveLength(0);
    expect(result.current.result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users'",
    });
  });

  it('reports INVALID_HEADER_KEY once a header name is invalid', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('https://api.example.com/users'));
    const rowId = result.current.headers[0].id;
    act(() => result.current.updateHeader(rowId, { key: 'Invalid Header', value: 'x' }));
    expect(result.current.result).toEqual({
      success: false,
      error: { code: ErrorCodes.INVALID_HEADER_KEY, message: expect.any(String) },
    });
  });

  it('includes the body in the command once the method accepts one', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('https://api.example.com/users'));
    act(() => result.current.setMethod('POST'));
    act(() => result.current.setBody('{"name":"John"}'));
    expect(result.current.result).toEqual({
      success: true,
      command: 'curl -X POST \'https://api.example.com/users\' -d \'{"name":"John"}\'',
    });
  });

  it('ignores the body while the method is GET', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('https://api.example.com/users'));
    act(() => result.current.setBody('{"should":"be ignored"}'));
    expect(result.current.result).toEqual({
      success: true,
      command: "curl -X GET 'https://api.example.com/users'",
    });
  });

  it('switches to multi-line formatting live', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('https://api.example.com/users'));
    act(() => result.current.setMethod('POST'));
    act(() => result.current.setBody('{}'));
    act(() => result.current.setFormat('multiLine'));
    expect(result.current.result).toEqual({
      success: true,
      command: ["curl -X POST 'https://api.example.com/users' \\", "  -d '{}'"].join('\n'),
    });
  });

  it('handleClear resets method, url, rows, and body but keeps the current format', () => {
    const { result } = renderHook(() => useCurlGeneratorHooks());
    act(() => result.current.setUrl('https://api.example.com/users'));
    act(() => result.current.setMethod('POST'));
    act(() => result.current.setBody('{}'));
    act(() => result.current.addQueryParam());
    act(() => result.current.addHeader());
    act(() => result.current.setFormat('multiLine'));

    act(() => result.current.handleClear());

    expect(result.current.method).toBe('GET');
    expect(result.current.url).toBe('');
    expect(result.current.queryParams).toHaveLength(1);
    expect(result.current.queryParams[0]).toMatchObject({ key: '', value: '' });
    expect(result.current.headers).toHaveLength(1);
    expect(result.current.headers[0]).toMatchObject({ key: '', value: '' });
    expect(result.current.body).toBe('');
    expect(result.current.format).toBe('multiLine');
    expect(result.current.result).toBeNull();
  });
});
