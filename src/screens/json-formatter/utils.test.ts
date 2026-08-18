import { describe, expect, it } from 'vitest';
import {
  MAX_UPLOAD_SIZE_BYTES,
  formatJson,
  minifyJson,
  validateJson,
  validateUploadFile,
} from './utils';

describe('formatJson', () => {
  it('formats a valid object with 2-space indent', () => {
    const result = formatJson('{"name":"John","age":30}', 2);
    expect(result).toEqual({ success: true, output: '{\n  "name": "John",\n  "age": 30\n}' });
  });

  it('formats a nested object', () => {
    const result = formatJson('{"user":{"name":"John","address":{"city":"Hanoi"}}}', 2);
    expect(result).toEqual({
      success: true,
      output:
        '{\n  "user": {\n    "name": "John",\n    "address": {\n      "city": "Hanoi"\n    }\n  }\n}',
    });
  });

  it('formats an array', () => {
    const result = formatJson('[1,2,3]', 2);
    expect(result).toEqual({ success: true, output: '[\n  1,\n  2,\n  3\n]' });
  });

  it('formats primitive values', () => {
    expect(formatJson('42', 2)).toEqual({ success: true, output: '42' });
    expect(formatJson('"hello"', 2)).toEqual({ success: true, output: '"hello"' });
    expect(formatJson('true', 2)).toEqual({ success: true, output: 'true' });
    expect(formatJson('null', 2)).toEqual({ success: true, output: 'null' });
  });

  it('formats an empty object', () => {
    expect(formatJson('{}', 2)).toEqual({ success: true, output: '{}' });
  });

  it('formats an empty array', () => {
    expect(formatJson('[]', 2)).toEqual({ success: true, output: '[]' });
  });

  it('supports 4-space indent', () => {
    expect(formatJson('{"a":1}', 4)).toEqual({ success: true, output: '{\n    "a": 1\n}' });
  });

  it('supports tab indent', () => {
    expect(formatJson('{"a":1}', 'tab')).toEqual({ success: true, output: '{\n\t"a": 1\n}' });
  });

  it('returns a PARSE_ERROR with line/column for invalid JSON', () => {
    const result = formatJson('{"a":1,}', 2);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('PARSE_ERROR');
      expect(result.error.line).toBe(1);
      expect(result.error.column).toBeGreaterThan(0);
      expect(result.error.message.length).toBeGreaterThan(0);
    }
  });

  it('returns EMPTY_INPUT for blank input', () => {
    expect(formatJson('   \n  ', 2)).toEqual({
      success: false,
      error: { code: 'EMPTY_INPUT', message: '' },
    });
  });
});

describe('minifyJson', () => {
  it('minifies a formatted object', () => {
    const input = '{\n  "name": "John",\n  "age": 30\n}';
    expect(minifyJson(input)).toEqual({ success: true, output: '{"name":"John","age":30}' });
  });

  it('minifies nested JSON', () => {
    const input = '{\n  "user": {\n    "name": "John"\n  }\n}';
    expect(minifyJson(input)).toEqual({ success: true, output: '{"user":{"name":"John"}}' });
  });

  it('minifies arrays', () => {
    expect(minifyJson('[\n  1,\n  2,\n  3\n]')).toEqual({ success: true, output: '[1,2,3]' });
  });

  it('returns a PARSE_ERROR for invalid JSON', () => {
    const result = minifyJson('{invalid}');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('PARSE_ERROR');
  });
});

describe('validateJson', () => {
  it('accepts valid JSON', () => {
    expect(validateJson('{"a":1}')).toEqual({ success: true });
  });

  it('rejects invalid JSON with a specific message', () => {
    const result = validateJson('{a:1}');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('PARSE_ERROR');
      expect(result.error.message.length).toBeGreaterThan(0);
    }
  });

  it('rejects empty input as EMPTY_INPUT, not a generic parse error', () => {
    expect(validateJson('')).toEqual({
      success: false,
      error: { code: 'EMPTY_INPUT', message: '' },
    });
  });
});

describe('edge cases', () => {
  it('treats whitespace-only input as empty', () => {
    const result = validateJson('   \t\n  ');
    expect(result).toEqual({ success: false, error: { code: 'EMPTY_INPUT', message: '' } });
  });

  it('parses input with surrounding whitespace', () => {
    expect(validateJson('  \n {"a":1} \n ')).toEqual({ success: true });
  });

  it('round-trips escaped strings', () => {
    const result = formatJson('{"quote":"a\\"b","backslash":"a\\\\b"}', 2);
    expect(result).toEqual({
      success: true,
      output: '{\n  "quote": "a\\"b",\n  "backslash": "a\\\\b"\n}',
    });
  });

  it('round-trips unicode content', () => {
    expect(formatJson('{"lang":"日本語","emoji":"🎉"}', 2)).toEqual({
      success: true,
      output: '{\n  "lang": "日本語",\n  "emoji": "🎉"\n}',
    });
  });

  it('round-trips null', () => {
    expect(minifyJson('{"value":null}')).toEqual({ success: true, output: '{"value":null}' });
  });

  it('round-trips booleans', () => {
    expect(minifyJson('{"a":true,"b":false}')).toEqual({
      success: true,
      output: '{"a":true,"b":false}',
    });
  });

  it('round-trips numbers including negatives and exponents', () => {
    const result = formatJson('{"a":-1.5,"b":2e10,"c":0}', 2);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(JSON.parse(result.output)).toEqual({ a: -1.5, b: 2e10, c: 0 });
    }
  });

  it('formats deeply nested JSON without throwing', () => {
    const deep = Array.from({ length: 50 }).reduce((acc: unknown) => ({ nested: acc }), 'leaf');
    const input = JSON.stringify(deep);
    const result = formatJson(input, 2);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(JSON.parse(result.output)).toEqual(deep);
    }
  });
});

describe('validateUploadFile', () => {
  it('accepts a valid .json file', () => {
    expect(validateUploadFile({ name: 'data.json', size: 100, type: 'application/json' })).toEqual({
      valid: true,
    });
  });

  it('accepts a file with application/json type but no .json extension', () => {
    expect(validateUploadFile({ name: 'data', size: 100, type: 'application/json' })).toEqual({
      valid: true,
    });
  });

  it('rejects a non-JSON file', () => {
    expect(validateUploadFile({ name: 'notes.txt', size: 100, type: 'text/plain' })).toEqual({
      valid: false,
      reason: 'INVALID_TYPE',
    });
  });

  it('rejects an empty file', () => {
    expect(validateUploadFile({ name: 'data.json', size: 0, type: 'application/json' })).toEqual({
      valid: false,
      reason: 'EMPTY',
    });
  });

  it('rejects a file larger than the max upload size', () => {
    expect(
      validateUploadFile({
        name: 'data.json',
        size: MAX_UPLOAD_SIZE_BYTES + 1,
        type: 'application/json',
      }),
    ).toEqual({ valid: false, reason: 'TOO_LARGE' });
  });

  it('accepts a file exactly at the max upload size', () => {
    expect(
      validateUploadFile({
        name: 'data.json',
        size: MAX_UPLOAD_SIZE_BYTES,
        type: 'application/json',
      }),
    ).toEqual({ valid: true });
  });
});
