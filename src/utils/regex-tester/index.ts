import { MAX_MATCHES } from '~root/constants';
import type { CreateRegexResult, GetMatchesResult, RegexError, RegexMatch } from '~root/types';

export function formatRegexError(err: unknown): RegexError {
  const raw = err instanceof Error ? err.message : String(err);
  const match = raw.match(/Invalid regular expression:.*?:\s*(.+)$/);
  return { message: match ? match[1] : raw };
}

export function createRegex(pattern: string, flags: string): CreateRegexResult {
  try {
    return { success: true, regex: new RegExp(pattern, flags) };
  } catch (err) {
    return { success: false, error: formatRegexError(err) };
  }
}

export const toRegexMatch = (m: RegExpExecArray): RegexMatch => ({
  index: m.index,
  length: m[0].length,
  value: m[0],
  groups: m.slice(1),
  namedGroups: m.groups ? { ...m.groups } : undefined,
});

export function getMatches(regex: RegExp, testString: string): GetMatchesResult {
  // Always compile a fresh RegExp from source+flags so this function never
  // mutates (or is affected by) the caller's lastIndex.
  const exec = new RegExp(regex.source, regex.flags);
  const matches: RegexMatch[] = [];

  if (!exec.global && !exec.sticky) {
    const m = exec.exec(testString);
    if (m) matches.push(toRegexMatch(m));
    return { matches, truncated: false };
  }

  let truncated = false;
  let m: RegExpExecArray | null;
  while ((m = exec.exec(testString)) !== null) {
    matches.push(toRegexMatch(m));
    if (m[0].length === 0) {
      // Prevent an infinite loop on a zero-length match (classic JS regex gotcha).
      exec.lastIndex += 1;
    }
    if (matches.length >= MAX_MATCHES) {
      truncated = true;
      break;
    }
  }
  return { matches, truncated };
}

export function replaceMatches(regex: RegExp, testString: string, replacement: string): string {
  return testString.replace(regex, replacement);
}
