import { describe, expect, it } from 'vitest';
import { createRegex, formatRegexError, getMatches, replaceMatches } from './index';
import { MAX_MATCHES } from '~root/constants';

describe('createRegex', () => {
  it('compiles a valid pattern with no flags', () => {
    const result = createRegex('abc', '');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.regex.source).toBe('abc');
      expect(result.regex.flags).toBe('');
    }
  });

  it('compiles a valid pattern with multiple flags', () => {
    const result = createRegex('abc', 'gi');
    expect(result.success).toBe(true);
    if (result.success) expect(result.regex.flags).toBe('gi');
  });

  it('returns a clean error for an unterminated group', () => {
    const result = createRegex('(abc', '');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.message.length).toBeGreaterThan(0);
  });

  it('returns a clean error for an invalid character class', () => {
    expect(createRegex('[a-', '').success).toBe(false);
  });

  it('returns a clean error for an invalid flag', () => {
    expect(createRegex('abc', 'x').success).toBe(false);
  });

  it('compiles an empty pattern', () => {
    expect(createRegex('', '').success).toBe(true);
  });
});

describe('formatRegexError', () => {
  it('strips the "Invalid regular expression: /.../: " prefix from V8 messages', () => {
    let message = '';
    try {
      // eslint-disable-next-line no-invalid-regexp -- deliberately invalid, to inspect the thrown error
      new RegExp('(abc', '');
    } catch (err) {
      message = formatRegexError(err).message;
    }
    expect(message).not.toContain('Invalid regular expression');
    expect(message.length).toBeGreaterThan(0);
  });

  it('falls back to the raw value for non-Error throws', () => {
    expect(formatRegexError('boom').message).toBe('boom');
  });
});

const compile = (pattern: string, flags: string): RegExp => {
  const result = createRegex(pattern, flags);
  if (!result.success) throw new Error(`expected ${pattern} to compile`);
  return result.regex;
};

describe('getMatches — basic matching', () => {
  it('finds an exact match', () => {
    expect(getMatches(compile('^Khoa$', ''), 'Khoa').matches).toHaveLength(1);
  });

  it('finds a partial match', () => {
    expect(getMatches(compile('lo', ''), 'Hello').matches).toHaveLength(1);
  });

  it('returns no matches when the pattern does not match', () => {
    expect(getMatches(compile('xyz', ''), 'Hello').matches).toEqual([]);
  });

  it('without the g flag, only the first match is returned', () => {
    expect(getMatches(compile('a', ''), 'aaa').matches).toHaveLength(1);
  });

  it('with the g flag, all matches are returned', () => {
    expect(getMatches(compile('a', 'g'), 'aaa').matches).toHaveLength(3);
  });

  it('does not mutate the lastIndex of the regex it was given', () => {
    const regex = compile('a', 'g');
    getMatches(regex, 'aaa');
    expect(getMatches(regex, 'aaa').matches).toHaveLength(3);
  });
});

describe('getMatches — flags', () => {
  it('i: case-insensitive match', () => {
    expect(getMatches(compile('khoa', 'i'), 'KHOA').matches).toHaveLength(1);
  });

  it('m: ^ and $ match at line boundaries', () => {
    expect(getMatches(compile('^b', 'gm'), 'a\nb\nc').matches).toHaveLength(1);
  });

  it('s: dot matches newline', () => {
    expect(getMatches(compile('a.b', 's'), 'a\nb').matches).toHaveLength(1);
  });

  it('without s, dot does not match newline', () => {
    expect(getMatches(compile('a.b', ''), 'a\nb').matches).toEqual([]);
  });

  it('u: unicode-aware matching of astral characters', () => {
    expect(getMatches(compile('\\u{1F600}', 'gu'), '😀').matches).toHaveLength(1);
  });

  it('y: sticky match must start exactly at position 0, no forward search', () => {
    expect(getMatches(compile('a', 'y'), 'ab').matches).toHaveLength(1);
    expect(getMatches(compile('b', 'y'), 'ab').matches).toHaveLength(0);
  });

  it('d: compiles and matches normally with the indices flag set', () => {
    const { matches } = getMatches(compile('b', 'gd'), 'ab');
    expect(matches).toHaveLength(1);
    expect(matches[0].index).toBe(1);
  });
});

describe('getMatches — character classes', () => {
  it('\\d matches digits', () => {
    const { matches } = getMatches(compile('\\d+', 'g'), 'a1 b22');
    expect(matches.map((m) => m.value)).toEqual(['1', '22']);
  });

  it('\\w matches word characters', () => {
    const { matches } = getMatches(compile('\\w+', 'g'), 'foo_1 bar');
    expect(matches.map((m) => m.value)).toEqual(['foo_1', 'bar']);
  });

  it('\\s matches whitespace', () => {
    expect(getMatches(compile('\\s', 'g'), 'a b\tc').matches).toHaveLength(2);
  });

  it('a custom character class matches only listed characters', () => {
    expect(getMatches(compile('[aeiou]', 'g'), 'hello world').matches).toHaveLength(3);
  });
});

describe('getMatches — quantifiers', () => {
  it('* matches zero or more', () => {
    const { matches } = getMatches(compile('ab*', 'g'), 'a ab abb');
    expect(matches.map((m) => m.value)).toEqual(['a', 'ab', 'abb']);
  });

  it('+ matches one or more', () => {
    const { matches } = getMatches(compile('ab+', 'g'), 'a ab abb');
    expect(matches.map((m) => m.value)).toEqual(['ab', 'abb']);
  });

  it('? matches zero or one', () => {
    const { matches } = getMatches(compile('colou?r', 'g'), 'color colour');
    expect(matches.map((m) => m.value)).toEqual(['color', 'colour']);
  });

  it('{n,m} matches a bounded range', () => {
    const { matches } = getMatches(compile('a{2,3}', 'g'), 'a aa aaa aaaa');
    expect(matches.map((m) => m.value)).toEqual(['aa', 'aaa', 'aaa']);
  });
});

describe('getMatches — groups', () => {
  it('captures a simple group', () => {
    const { matches } = getMatches(compile('(\\w+)@(\\w+\\.\\w+)', ''), 'john@example.com');
    expect(matches[0].groups).toEqual(['john', 'example.com']);
  });

  it('captures nested groups outer-to-inner', () => {
    const { matches } = getMatches(compile('((a)(b))', ''), 'ab');
    expect(matches[0].groups).toEqual(['ab', 'a', 'b']);
  });

  it('non-capturing groups do not appear in groups[]', () => {
    const { matches } = getMatches(compile('(?:abc)(def)', ''), 'abcdef');
    expect(matches[0].groups).toEqual(['def']);
  });

  it('captures named groups into namedGroups', () => {
    const { matches } = getMatches(
      compile('(?<username>\\w+)@(?<domain>\\w+\\.\\w+)', ''),
      'john@example.com',
    );
    expect(matches[0].namedGroups).toEqual({ username: 'john', domain: 'example.com' });
  });

  it('leaves namedGroups undefined when the pattern has no named groups', () => {
    expect(getMatches(compile('(\\w+)', ''), 'abc').matches[0].namedGroups).toBeUndefined();
  });

  it('an unmatched optional group is undefined, not an empty string', () => {
    expect(getMatches(compile('a(b)?', ''), 'a').matches[0].groups).toEqual([undefined]);
  });
});

describe('getMatches — match info', () => {
  it('reports index, length, and value together', () => {
    const { matches } = getMatches(compile('World', ''), 'Hello World');
    expect(matches[0]).toMatchObject({ index: 6, length: 5, value: 'World' });
  });
});

describe('replaceMatches', () => {
  it('replaces only the first occurrence without the g flag', () => {
    expect(replaceMatches(compile('cat', ''), 'cat dog cat', 'fox')).toBe('fox dog cat');
  });

  it('replaces all occurrences with the g flag', () => {
    expect(replaceMatches(compile('cat', 'g'), 'cat dog cat', 'fox')).toBe('fox dog fox');
  });

  it('supports $& (whole match)', () => {
    expect(replaceMatches(compile('World', ''), 'Hello World', '[$&]')).toBe('Hello [World]');
  });

  it('supports $1 (numbered capture group)', () => {
    expect(replaceMatches(compile('(\\w+)@(\\w+)', ''), 'john@example', '$2:$1')).toBe(
      'example:john',
    );
  });

  it('supports $<name> (named capture group)', () => {
    const regex = compile('(?<user>\\w+)@(?<host>\\w+)', '');
    expect(replaceMatches(regex, 'john@example', '$<host>:$<user>')).toBe('example:john');
  });

  it("supports $` (before match) and $' (after match)", () => {
    const result = replaceMatches(compile('World', ''), 'Hello World!', "[$`|$']");
    expect(result).toBe('Hello [Hello |!]!');
  });

  it('supports $$ (literal dollar sign)', () => {
    expect(replaceMatches(compile('price', ''), 'price: 10', '$$')).toBe('$: 10');
  });
});

describe('edge cases', () => {
  it('an empty global pattern matches at every position', () => {
    expect(getMatches(compile('', 'g'), 'abc').matches).toHaveLength(4);
  });

  it('empty test string with a non-matching pattern yields no matches', () => {
    expect(getMatches(compile('a', 'g'), '').matches).toEqual([]);
  });

  it('empty test string with an empty pattern yields exactly one match', () => {
    expect(getMatches(compile('', 'g'), '').matches).toHaveLength(1);
  });

  it('matches unicode text', () => {
    expect(getMatches(compile('日本語', 'g'), 'こんにちは日本語です').matches).toHaveLength(1);
  });

  it('matches across multiple lines', () => {
    expect(getMatches(compile('^line', 'gm'), 'line1\nline2\nline3').matches).toHaveLength(3);
  });

  it('caps results at MAX_MATCHES and reports truncated', () => {
    const { matches, truncated } = getMatches(compile('a', 'g'), 'a'.repeat(MAX_MATCHES + 50));
    expect(matches).toHaveLength(MAX_MATCHES);
    expect(truncated).toBe(true);
  });

  it('does not report truncated when matches stay under the cap', () => {
    expect(getMatches(compile('a', 'g'), 'aaa').truncated).toBe(false);
  });
});
