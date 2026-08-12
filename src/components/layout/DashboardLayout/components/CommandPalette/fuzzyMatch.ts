const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

// Subsequence fuzzy match, diacritics-insensitive (VS Code Ctrl+P style).
// Returns null when `query` isn't a subsequence of `target`; otherwise a
// higher score means a better match — consecutive runs and matches at the
// start of a word score higher than scattered ones.
export const fuzzyScore = (query: string, target: string): number | null => {
  const normalizedQuery = normalize(query);
  const normalizedTarget = normalize(target);

  if (normalizedQuery.length === 0) return 1;

  let score = 0;
  let searchFrom = 0;
  let previousMatchIndex = -1;

  for (const char of normalizedQuery) {
    const foundIndex = normalizedTarget.indexOf(char, searchFrom);
    if (foundIndex === -1) return null;

    const isConsecutive = previousMatchIndex !== -1 && foundIndex === previousMatchIndex + 1;
    const isWordStart = foundIndex === 0 || normalizedTarget[foundIndex - 1] === ' ';
    const gap = previousMatchIndex === -1 ? 0 : foundIndex - previousMatchIndex - 1;

    score += 10 + (isConsecutive ? 15 : 0) + (isWordStart ? 10 : 0) - gap;

    previousMatchIndex = foundIndex;
    searchFrom = foundIndex + 1;
  }

  return score;
};
