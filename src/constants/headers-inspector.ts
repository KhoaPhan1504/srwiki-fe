import type { HeaderCategory } from '~root/types';

// Fixed display order for important-header categories — used ahead of the
// alphabetical fallback so grouping/sorting/copy-all/raw output all agree.
export const IMPORTANT_HEADER_CATEGORY_ORDER: HeaderCategory[] = [
  'content',
  'caching',
  'cors',
  'security',
  'server',
];

// Lower-case header name -> category. Callers must lower-case the header
// name from the response before looking it up here (HTTP header names are
// case-insensitive; a server may send `Content-Type` or `content-type`).
export const IMPORTANT_HEADERS: Record<string, HeaderCategory> = {
  'content-type': 'content',
  'content-length': 'content',
  'content-encoding': 'content',

  'cache-control': 'caching',
  etag: 'caching',
  expires: 'caching',
  'last-modified': 'caching',
  age: 'caching',

  'access-control-allow-origin': 'cors',
  'access-control-allow-methods': 'cors',
  'access-control-allow-headers': 'cors',
  'access-control-allow-credentials': 'cors',
  'access-control-expose-headers': 'cors',

  'strict-transport-security': 'security',
  'content-security-policy': 'security',
  'x-content-type-options': 'security',
  'referrer-policy': 'security',
  'permissions-policy': 'security',

  server: 'server',
  date: 'server',
  location: 'server',
};
