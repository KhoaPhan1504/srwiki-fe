import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64 } from '.';

describe('encodeBase64', () => {
  it('encodes plain ASCII text', () => {
    expect(encodeBase64('Hello')).toEqual({ success: true, output: 'SGVsbG8=' });
  });

  it('encodes Vietnamese text as UTF-8', () => {
    const result = encodeBase64('Xin chào');
    expect(result).toEqual({
      success: true,
      output: btoa(unescape(encodeURIComponent('Xin chào'))),
    });
  });

  it('encodes emoji as UTF-8', () => {
    const result = encodeBase64('😀');
    expect(result).toEqual({ success: true, output: btoa(unescape(encodeURIComponent('😀'))) });
  });

  it('returns EMPTY_INPUT for an empty string', () => {
    const result = encodeBase64('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('EMPTY_INPUT');
    }
  });

  it('encodes very long input', () => {
    const long = 'a'.repeat(100_000);
    const result = encodeBase64(long);
    expect(result.success).toBe(true);
  });
});

describe('decodeBase64', () => {
  it('decodes standard base64 to ASCII text', () => {
    expect(decodeBase64('SGVsbG8=')).toEqual({ success: true, output: 'Hello' });
  });

  it('decodes Vietnamese text encoded as UTF-8', () => {
    const encoded = btoa(unescape(encodeURIComponent('Xin chào')));
    expect(decodeBase64(encoded)).toEqual({ success: true, output: 'Xin chào' });
  });

  it('decodes emoji encoded as UTF-8', () => {
    const encoded = btoa(unescape(encodeURIComponent('😀')));
    expect(decodeBase64(encoded)).toEqual({ success: true, output: '😀' });
  });

  it('is the inverse of encodeBase64 for arbitrary Unicode text', () => {
    const original = 'Xin chào 👋 — Hello, World!';
    const encoded = encodeBase64(original);
    expect(encoded.success).toBe(true);
    if (encoded.success) {
      expect(decodeBase64(encoded.output)).toEqual({ success: true, output: original });
    }
  });

  it('returns EMPTY_INPUT for an empty string', () => {
    const result = decodeBase64('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('EMPTY_INPUT');
    }
  });

  it('returns EMPTY_INPUT for whitespace-only input', () => {
    const result = decodeBase64('   \n  ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('EMPTY_INPUT');
    }
  });

  it('strips embedded whitespace and newlines before decoding', () => {
    expect(decodeBase64('SGVs\nbG8=  ')).toEqual({ success: true, output: 'Hello' });
  });

  it('tolerates missing padding', () => {
    expect(decodeBase64('SGVsbG8')).toEqual({ success: true, output: 'Hello' });
  });

  it('returns INVALID_BASE64 for characters outside the base64 alphabet', () => {
    const result = decodeBase64('not valid base64!!!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_BASE64');
      expect(result.error.message.length).toBeGreaterThan(0);
    }
  });

  it('returns INVALID_BASE64 for a group that cannot be padded into a valid length', () => {
    const result = decodeBase64('S');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_BASE64');
    }
  });
});
