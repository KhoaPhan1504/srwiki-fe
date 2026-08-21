import type { AuthConfig, BodyType, HttpMethod } from '~root/types';

export const REST_CLIENT_TIMEOUT_MS = 30_000;

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export const AUTH_TYPES: AuthConfig['type'][] = ['none', 'bearer', 'basic', 'apiKey'];

export const BODY_TYPES: BodyType[] = ['raw', 'formData', 'urlEncoded'];

// Per the Fetch spec, only GET (and HEAD, which we don't expose) is forbidden from
// carrying a body — fetch() throws a TypeError if you try. DELETE is allowed a body
// (e.g. bulk-delete-by-id-list APIs), so it's intentionally not in this list.
export const METHODS_WITHOUT_BODY: HttpMethod[] = ['GET'];

// Fetch's "forbidden request-header name" list (https://fetch.spec.whatwg.org/#forbidden-request-header) —
// the browser silently strips or overrides these regardless of what we send, so we filter
// them out before building the request instead of sending something the user can't rely on.
export const FORBIDDEN_HEADER_NAMES = new Set([
  'accept-charset',
  'accept-encoding',
  'access-control-request-headers',
  'access-control-request-method',
  'connection',
  'content-length',
  'cookie',
  'cookie2',
  'date',
  'dnt',
  'expect',
  'host',
  'keep-alive',
  'origin',
  'referer',
  'set-cookie',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'via',
]);

export const FORBIDDEN_HEADER_PREFIXES = ['proxy-', 'sec-'];

// RFC 7230 token characters — a valid HTTP header name.
export const HEADER_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
