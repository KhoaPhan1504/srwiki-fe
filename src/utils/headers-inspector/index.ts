import type { HeaderEntry } from '~root/types';
import { IMPORTANT_HEADER_CATEGORY_ORDER, IMPORTANT_HEADERS } from '~root/constants';

/**
 * Sorts headers with "important" ones first (grouped by category in fixed order),
 * then "unknown" headers alphabetically.
 * Returns a new array without mutating the input.
 *
 * Important headers are identified by case-insensitive lookup in IMPORTANT_HEADERS.
 * Within each category group, headers sort alphabetically by name (case-insensitive).
 * Unknown headers (not in IMPORTANT_HEADERS) form the final block, also sorted alphabetically.
 */
export function sortHeaders(headers: HeaderEntry[]): HeaderEntry[] {
  // Separate into important and unknown headers.
  const importantHeaders: HeaderEntry[] = [];
  const unknownHeaders: HeaderEntry[] = [];

  for (const header of headers) {
    const lowerName = header.name.toLowerCase();
    if (lowerName in IMPORTANT_HEADERS) {
      importantHeaders.push(header);
    } else {
      unknownHeaders.push(header);
    }
  }

  // Sort unknown headers alphabetically by name (case-insensitive).
  unknownHeaders.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  // Group important headers by category.
  const byCategory = new Map<string, HeaderEntry[]>();
  for (const header of importantHeaders) {
    const category = IMPORTANT_HEADERS[header.name.toLowerCase()];
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(header);
  }

  // Sort each category group alphabetically by header name (case-insensitive).
  for (const group of byCategory.values()) {
    group.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }

  // Build the final result: important groups in fixed order, then unknowns.
  const result: HeaderEntry[] = [];

  for (const category of IMPORTANT_HEADER_CATEGORY_ORDER) {
    const group = byCategory.get(category);
    if (group) {
      result.push(...group);
    }
  }

  result.push(...unknownHeaders);
  return result;
}

/**
 * Filters headers by case-insensitive substring match against header name only.
 * Returns a new array with matching headers in their original order.
 * Empty or whitespace-only query returns all headers unchanged.
 */
export function filterHeadersByName(headers: HeaderEntry[], query: string): HeaderEntry[] {
  const trimmedQuery = query.trim();

  // Empty query returns all headers.
  if (!trimmedQuery) {
    return headers;
  }

  const lowerQuery = trimmedQuery.toLowerCase();

  return headers.filter((header) => header.name.toLowerCase().includes(lowerQuery));
}

/**
 * Formats headers as "name: value" lines joined by newlines.
 * Preserves the input order (does not sort).
 * Empty array returns empty string.
 */
export function formatHeadersRaw(headers: HeaderEntry[]): string {
  return headers.map((header) => `${header.name}: ${header.value}`).join('\n');
}
