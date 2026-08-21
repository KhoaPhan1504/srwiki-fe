import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type {
  AuthConfig,
  BodyType,
  HttpMethod,
  KeyValuePair,
  RestClientError,
  RestClientStatus,
  RestResponse,
  SavedRequest,
} from '~root/types';
import { applyVariablesToConfig, createEmptyKeyValuePair, executeRestRequest } from '~root/utils';

const ENVIRONMENT_ID_STORAGE_KEY = 'rest-api-client-environment-id';

const addRow = (setRows: Dispatch<SetStateAction<KeyValuePair[]>>) => {
  setRows((rows) => [...rows, createEmptyKeyValuePair()]);
};

const updateRow = (
  setRows: Dispatch<SetStateAction<KeyValuePair[]>>,
  id: string,
  patch: Partial<KeyValuePair>,
) => {
  setRows((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
};

const removeRow = (setRows: Dispatch<SetStateAction<KeyValuePair[]>>, id: string) => {
  setRows((rows) => rows.filter((row) => row.id !== id));
};

export const useRestApiClientHooks = () => {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>(() => [createEmptyKeyValuePair()]);
  const [headers, setHeaders] = useState<KeyValuePair[]>(() => [createEmptyKeyValuePair()]);
  const [body, setBody] = useState('');
  const [bodyType, setBodyType] = useState<BodyType>('raw');
  const [bodyFields, setBodyFields] = useState<KeyValuePair[]>(() => [createEmptyKeyValuePair()]);
  const [auth, setAuth] = useState<AuthConfig>({ type: 'none' });
  const [loadedRequestId, setLoadedRequestId] = useState<string | null>(null);
  const [environmentId, setEnvironmentIdState] = useState<string | null>(() =>
    localStorage.getItem(ENVIRONMENT_ID_STORAGE_KEY),
  );
  const setEnvironmentId = (id: string | null) => {
    setEnvironmentIdState(id);
    if (id) localStorage.setItem(ENVIRONMENT_ID_STORAGE_KEY, id);
    else localStorage.removeItem(ENVIRONMENT_ID_STORAGE_KEY);
  };

  const [status, setStatus] = useState<RestClientStatus>('idle');
  const [response, setResponse] = useState<RestResponse | null>(null);
  const [error, setError] = useState<RestClientError | null>(null);

  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      requestIdRef.current += 1;
    };
  }, []);

  const handleSend = async (mergedVariables: KeyValuePair[] = []) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = (requestIdRef.current += 1);

    setStatus('sending');
    setResponse(null);
    setError(null);

    const requestConfig = { method, url, queryParams, headers, body, bodyType, bodyFields, auth };
    const result = await executeRestRequest(
      applyVariablesToConfig(requestConfig, mergedVariables),
      controller.signal,
    );

    if (requestId !== requestIdRef.current) return;

    if (result.success) {
      setStatus('success');
      setResponse(result.response);
    } else {
      setStatus('error');
      setError(result.error);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  const handleClear = () => {
    abortControllerRef.current?.abort();
    requestIdRef.current += 1;
    setMethod('GET');
    setUrl('');
    setQueryParams([createEmptyKeyValuePair()]);
    setHeaders([createEmptyKeyValuePair()]);
    setBody('');
    setBodyType('raw');
    setBodyFields([createEmptyKeyValuePair()]);
    setAuth({ type: 'none' });
    setLoadedRequestId(null);
    setStatus('idle');
    setResponse(null);
    setError(null);
  };

  const loadSavedRequest = (request: SavedRequest) => {
    setMethod(request.method);
    setUrl(request.url);
    setQueryParams(request.queryParams);
    setHeaders(request.headers);
    setBody(request.body);
    setBodyType(request.bodyType);
    setBodyFields(request.bodyFields);
    setAuth(request.auth);
    setLoadedRequestId(request.id);
  };

  return {
    method,
    setMethod,
    url,
    setUrl,
    queryParams,
    addQueryParam: () => addRow(setQueryParams),
    updateQueryParam: (id: string, patch: Partial<KeyValuePair>) =>
      updateRow(setQueryParams, id, patch),
    removeQueryParam: (id: string) => removeRow(setQueryParams, id),
    headers,
    addHeader: () => addRow(setHeaders),
    updateHeader: (id: string, patch: Partial<KeyValuePair>) => updateRow(setHeaders, id, patch),
    removeHeader: (id: string) => removeRow(setHeaders, id),
    body,
    setBody,
    bodyType,
    setBodyType,
    bodyFields,
    addBodyField: () => addRow(setBodyFields),
    updateBodyField: (id: string, patch: Partial<KeyValuePair>) =>
      updateRow(setBodyFields, id, patch),
    removeBodyField: (id: string) => removeRow(setBodyFields, id),
    auth,
    setAuth,
    loadedRequestId,
    setLoadedRequestId,
    loadSavedRequest,
    environmentId,
    setEnvironmentId,
    status,
    response,
    error,
    handleSend,
    handleCancel,
    handleClear,
  };
};
