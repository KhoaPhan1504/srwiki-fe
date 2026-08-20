import { describe, expect, it } from 'vitest';
import { decodeUrl, encodeUrl } from '.';

describe('encodeUrl', () => {
  it('encodes spaces as %20', () => {
    expect(encodeUrl('hello world')).toEqual({ success: true, output: 'hello%20world' });
  });

  it('encodes reserved query-string characters', () => {
    const result = encodeUrl('hello world?name=John Doe');
    expect(result).toEqual({
      success: true,
      output: encodeURIComponent('hello world?name=John Doe'),
    });
    expect(result).toEqual({ success: true, output: 'hello%20world%3Fname%3DJohn%20Doe' });
  });

  it('encodes Vietnamese text as percent-encoded UTF-8', () => {
    const result = encodeUrl('Xin chào');
    expect(result).toEqual({ success: true, output: encodeURIComponent('Xin chào') });
  });

  it('encodes emoji as percent-encoded UTF-8', () => {
    const result = encodeUrl('😀');
    expect(result).toEqual({ success: true, output: encodeURIComponent('😀') });
  });

  it('returns EMPTY_INPUT for an empty string', () => {
    const result = encodeUrl('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('EMPTY_INPUT');
    }
  });

  it('encodes very long input', () => {
    const long = 'a b'.repeat(50_000);
    const result = encodeUrl(long);
    expect(result.success).toBe(true);
  });
});

describe('decodeUrl', () => {
  it('decodes %20 back to a space', () => {
    expect(decodeUrl('hello%20world')).toEqual({ success: true, output: 'hello world' });
  });

  it('decodes reserved query-string sequences (%2F %3F %26 %3D)', () => {
    expect(decodeUrl('a%2Fb%3Fc%3Dd%26e')).toEqual({ success: true, output: 'a/b?c=d&e' });
  });

  it('decodes Vietnamese text encoded as UTF-8', () => {
    const encoded = encodeURIComponent('Xin chào');
    expect(decodeUrl(encoded)).toEqual({ success: true, output: 'Xin chào' });
  });

  it('decodes emoji encoded as UTF-8', () => {
    const encoded = encodeURIComponent('😀');
    expect(decodeUrl(encoded)).toEqual({ success: true, output: '😀' });
  });

  it('is the inverse of encodeUrl for arbitrary Unicode text', () => {
    const original = 'Xin chào 👋 — Hello, World! ?a=1&b=2';
    const encoded = encodeUrl(original);
    expect(encoded.success).toBe(true);
    if (encoded.success) {
      expect(decodeUrl(encoded.output)).toEqual({ success: true, output: original });
    }
  });

  it('leaves literal, unencoded characters untouched', () => {
    expect(decodeUrl('plain text')).toEqual({ success: true, output: 'plain text' });
  });

  it('decodes only one layer of a double-encoded value', () => {
    const doubleEncoded = encodeURIComponent(encodeURIComponent('a b'));
    expect(decodeUrl(doubleEncoded)).toEqual({ success: true, output: encodeURIComponent('a b') });
  });

  it('returns EMPTY_INPUT for an empty string', () => {
    const result = decodeUrl('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('EMPTY_INPUT');
    }
  });

  it('returns INVALID_URI_ENCODING for a lone percent sign', () => {
    const result = decodeUrl('100% done');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_URI_ENCODING');
      expect(result.error.message.length).toBeGreaterThan(0);
    }
  });

  it('returns INVALID_URI_ENCODING for non-hex digits after %', () => {
    const result = decodeUrl('%zz');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_URI_ENCODING');
    }
  });

  it('returns INVALID_URI_ENCODING for a truncated escape sequence', () => {
    const result = decodeUrl('abc%2');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_URI_ENCODING');
    }
  });

  it('returns INVALID_URI_ENCODING for a malformed multi-byte UTF-8 sequence', () => {
    const result = decodeUrl('%E0%A4%A');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_URI_ENCODING');
    }
  });
});
