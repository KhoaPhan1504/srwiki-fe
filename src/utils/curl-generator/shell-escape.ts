// POSIX single-quote wrapping: inside '...' every character is literal except '.
// Each embedded ' becomes '\'' — close quote, escaped quote, reopen quote — so the
// shell reassembles the three segments into one literal argument. This handles every
// shell metacharacter (no per-character escape list needed) and is the same strategy
// as Python's shlex.quote / Ruby's Shellwords.escape.
export const shellEscapeSingleQuote = (value: string): string =>
  `'${value.replace(/'/g, `'\\''`)}'`;
