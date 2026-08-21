import {
  ErrorCodes,
  FORBIDDEN_HEADER_NAMES,
  FORBIDDEN_HEADER_PREFIXES,
  HEADER_NAME_PATTERN,
  METHODS_WITHOUT_BODY,
  REST_CLIENT_TIMEOUT_MS,
} from '~root/constants';
import type {
  AuthConfig,
  KeyValuePair,
  RestClientError,
  RestClientResult,
  RestRequestConfig,
  RestResponse,
  RestResponseBody,
} from '~root/types';

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

export const createEmptyKeyValuePair = (): KeyValuePair => ({
  id: crypto.randomUUID(),
  key: '',
  value: '',
  enabled: true,
});

export const buildUrlWithParams = (rawUrl: string, params: KeyValuePair[]): string => {
  const url = new URL(rawUrl);
  params
    .filter((param) => param.enabled && param.key.trim() !== '')
    .forEach((param) => url.searchParams.append(param.key.trim(), param.value));
  return url.toString();
};

export const buildBodyFieldsSearchParams = (fields: KeyValuePair[]): URLSearchParams => {
  const params = new URLSearchParams();
  fields
    .filter((field) => field.enabled && field.key.trim() !== '')
    .forEach((field) => params.append(field.key.trim(), field.value));
  return params;
};

export const buildBodyFieldsFormData = (fields: KeyValuePair[]): FormData => {
  const formData = new FormData();
  fields
    .filter((field) => field.enabled && field.key.trim() !== '')
    .forEach((field) => formData.append(field.key.trim(), field.value));
  return formData;
};

export const buildSendableHeaders = (headers: KeyValuePair[]): Headers => {
  const result = new Headers();
  headers
    .filter((header) => header.enabled && header.key.trim() !== '')
    .forEach((header) => {
      const key = header.key.trim();
      const lowerKey = key.toLowerCase();
      if (FORBIDDEN_HEADER_NAMES.has(lowerKey)) return;
      if (FORBIDDEN_HEADER_PREFIXES.some((prefix) => lowerKey.startsWith(prefix))) return;
      result.set(key, header.value);
    });
  return result;
};

type AuthEntry = {
  header?: { key: string; value: string };
  query?: { key: string; value: string };
};

export const resolveAuthEntry = (auth: AuthConfig): AuthEntry | null => {
  switch (auth.type) {
    case 'none':
      return null;
    case 'bearer': {
      const token = auth.token.trim();
      return token ? { header: { key: 'Authorization', value: `Bearer ${token}` } } : null;
    }
    case 'basic': {
      if (!auth.username && !auth.password) return null;
      const credentials = btoa(`${auth.username}:${auth.password}`);
      return { header: { key: 'Authorization', value: `Basic ${credentials}` } };
    }
    case 'apiKey': {
      const key = auth.key.trim();
      if (!key) return null;
      const entry = { key, value: auth.value };
      return auth.addTo === 'query' ? { query: entry } : { header: entry };
    }
  }
};

export const mergeVariables = (
  globalVariables: KeyValuePair[],
  environmentVariables: KeyValuePair[],
): KeyValuePair[] => {
  const byKey = new Map<string, KeyValuePair>();
  [...globalVariables, ...environmentVariables]
    .filter((variable) => variable.enabled && variable.key.trim() !== '')
    .forEach((variable) => byKey.set(variable.key.trim(), variable));
  return Array.from(byKey.values());
};

export const substituteVariables = (text: string, variables: KeyValuePair[]): string =>
  text.replace(/\{\{\s*([^}\s]+)\s*\}\}/g, (match, key: string) => {
    const found = variables.find((variable) => variable.key.trim() === key);
    return found ? found.value : match;
  });

const substituteKeyValuePairs = (
  pairs: KeyValuePair[],
  variables: KeyValuePair[],
): KeyValuePair[] =>
  pairs.map((pair) => ({
    ...pair,
    key: substituteVariables(pair.key, variables),
    value: substituteVariables(pair.value, variables),
  }));

const substituteAuthConfig = (auth: AuthConfig, variables: KeyValuePair[]): AuthConfig => {
  switch (auth.type) {
    case 'none':
      return auth;
    case 'bearer':
      return { ...auth, token: substituteVariables(auth.token, variables) };
    case 'basic':
      return {
        ...auth,
        username: substituteVariables(auth.username, variables),
        password: substituteVariables(auth.password, variables),
      };
    case 'apiKey':
      return {
        ...auth,
        key: substituteVariables(auth.key, variables),
        value: substituteVariables(auth.value, variables),
      };
  }
};

export const applyVariablesToConfig = (
  config: RestRequestConfig,
  variables: KeyValuePair[],
): RestRequestConfig => {
  if (variables.length === 0) return config;
  return {
    ...config,
    url: substituteVariables(config.url, variables),
    queryParams: substituteKeyValuePairs(config.queryParams, variables),
    headers: substituteKeyValuePairs(config.headers, variables),
    body: substituteVariables(config.body, variables),
    bodyFields: substituteKeyValuePairs(config.bodyFields, variables),
    auth: substituteAuthConfig(config.auth, variables),
  };
};

export const validateRestRequest = (config: RestRequestConfig): RestClientError | null => {
  const trimmedUrl = config.url.trim();
  if (!trimmedUrl) {
    return { code: ErrorCodes.EMPTY_INPUT, message: '' };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return {
      code: ErrorCodes.INVALID_URL,
      message: 'Enter a valid absolute URL, e.g. https://api.example.com',
    };
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return {
      code: ErrorCodes.INVALID_URL,
      message: 'Only http:// and https:// URLs are supported',
    };
  }

  const invalidHeader = config.headers.find(
    (header) =>
      header.enabled && header.key.trim() !== '' && !HEADER_NAME_PATTERN.test(header.key.trim()),
  );
  if (invalidHeader) {
    return {
      code: ErrorCodes.INVALID_HEADER_KEY,
      message: `"${invalidHeader.key}" is not a valid header name`,
    };
  }

  if (
    config.bodyType === 'raw' &&
    !METHODS_WITHOUT_BODY.includes(config.method) &&
    config.body.trim() !== ''
  ) {
    try {
      JSON.parse(config.body);
    } catch {
      return { code: ErrorCodes.INVALID_JSON_BODY, message: 'Request body must be valid JSON' };
    }
  }

  return null;
};

const buildHeadersRecord = (headers: Headers): Record<string, string> => {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
};

const parseResponseBody = (text: string, contentType: string | null): RestResponseBody => {
  const looksJson = (contentType?.includes('json') ?? false) || /^\s*[[{]/.test(text);
  if (looksJson) {
    try {
      return { isJson: true, json: JSON.parse(text), text };
    } catch {
      // Not actually valid JSON — fall through and treat it as plain text.
    }
  }
  return { isJson: false, text };
};

const normalizeResponse = async (response: Response, durationMs: number): Promise<RestResponse> => {
  const text = await response.text();
  const contentLength = response.headers.get('content-length');

  return {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    headers: buildHeadersRecord(response.headers),
    durationMs,
    sizeBytes: contentLength ? Number(contentLength) : new TextEncoder().encode(text).length,
    body: parseResponseBody(text, response.headers.get('content-type')),
  };
};

const classifyFetchError = (err: unknown, signal: AbortSignal): RestClientError => {
  if (err instanceof DOMException && err.name === 'AbortError') {
    if (signal.reason === 'timeout') {
      return {
        code: ErrorCodes.REQUEST_TIMEOUT,
        message: `Request timed out after ${REST_CLIENT_TIMEOUT_MS / 1000}s`,
      };
    }
    return { code: ErrorCodes.REQUEST_ABORTED, message: 'Request was cancelled' };
  }
  return { code: ErrorCodes.NETWORK_ERROR, message: errorMessage(err) };
};

export const executeRestRequest = async (
  config: RestRequestConfig,
  externalSignal?: AbortSignal,
): Promise<RestClientResult> => {
  const validationError = validateRestRequest(config);
  if (validationError) return { success: false, error: validationError };

  let url = buildUrlWithParams(config.url, config.queryParams);
  const headers = buildSendableHeaders(config.headers);
  const authEntry = resolveAuthEntry(config.auth);
  if (authEntry?.header) {
    headers.set(authEntry.header.key, authEntry.header.value);
  }
  if (authEntry?.query) {
    const urlWithAuth = new URL(url);
    urlWithAuth.searchParams.set(authEntry.query.key, authEntry.query.value);
    url = urlWithAuth.toString();
  }
  const methodTakesBody = !METHODS_WITHOUT_BODY.includes(config.method);
  const bodyFieldsHaveContent = config.bodyFields.some(
    (field) => field.enabled && field.key.trim() !== '',
  );
  const hasBody =
    methodTakesBody &&
    (config.bodyType === 'raw' ? config.body.trim() !== '' : bodyFieldsHaveContent);

  let requestBody: BodyInit | undefined;
  if (hasBody) {
    if (config.bodyType === 'urlEncoded') {
      requestBody = buildBodyFieldsSearchParams(config.bodyFields);
      if (!headers.has('content-type')) {
        headers.set('Content-Type', 'application/x-www-form-urlencoded');
      }
    } else if (config.bodyType === 'formData') {
      requestBody = buildBodyFieldsFormData(config.bodyFields);
      headers.delete('content-type');
    } else {
      requestBody = config.body;
      if (!headers.has('content-type')) {
        headers.set('Content-Type', 'application/json');
      }
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), REST_CLIENT_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort('aborted');
  externalSignal?.addEventListener('abort', onExternalAbort);

  const startedAt = performance.now();
  try {
    const response = await fetch(url, {
      method: config.method,
      headers,
      body: requestBody,
      signal: controller.signal,
    });
    const durationMs = performance.now() - startedAt;
    return { success: true, response: await normalizeResponse(response, durationMs) };
  } catch (err) {
    return { success: false, error: classifyFetchError(err, controller.signal) };
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
};

export const formatResponseDuration = (durationMs: number): string => {
  if (durationMs < 1000) return `${Math.round(durationMs)} ms`;
  return `${(durationMs / 1000).toFixed(2)} s`;
};

export const formatResponseSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
