import { useState } from 'react';
import { ErrorCodes } from '~root/constants';
import type {
  CurlCommandFormat,
  CurlGenerationResult,
  CurlRequestConfig,
  HttpMethod,
  KeyValuePair,
} from '~root/types';
import { createEmptyKeyValuePair, generateCurlCommand } from '~root/utils';

export const useCurlGeneratorHooks = () => {
  const [method, setMethodState] = useState<HttpMethod>('GET');
  const [url, setUrlState] = useState('');
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>(() => [createEmptyKeyValuePair()]);
  const [headers, setHeaders] = useState<KeyValuePair[]>(() => [createEmptyKeyValuePair()]);
  const [body, setBodyState] = useState('');
  const [format, setFormatState] = useState<CurlCommandFormat>('singleLine');
  const [result, setResult] = useState<CurlGenerationResult | null>(null);

  const currentConfig = (): CurlRequestConfig => ({ method, url, queryParams, headers, body });

  const recompute = (config: CurlRequestConfig, nextFormat: CurlCommandFormat) => {
    const nextResult = generateCurlCommand(config, nextFormat);
    setResult(
      !nextResult.success && nextResult.error.code === ErrorCodes.EMPTY_INPUT ? null : nextResult,
    );
  };

  const setMethod = (nextMethod: HttpMethod) => {
    setMethodState(nextMethod);
    recompute({ ...currentConfig(), method: nextMethod }, format);
  };

  const setUrl = (nextUrl: string) => {
    setUrlState(nextUrl);
    recompute({ ...currentConfig(), url: nextUrl }, format);
  };

  const setBody = (nextBody: string) => {
    setBodyState(nextBody);
    recompute({ ...currentConfig(), body: nextBody }, format);
  };

  const setFormat = (nextFormat: CurlCommandFormat) => {
    setFormatState(nextFormat);
    recompute(currentConfig(), nextFormat);
  };

  const addQueryParam = () => {
    const nextQueryParams = [...queryParams, createEmptyKeyValuePair()];
    setQueryParams(nextQueryParams);
    recompute({ ...currentConfig(), queryParams: nextQueryParams }, format);
  };

  const updateQueryParam = (id: string, patch: Partial<KeyValuePair>) => {
    const nextQueryParams = queryParams.map((row) => (row.id === id ? { ...row, ...patch } : row));
    setQueryParams(nextQueryParams);
    recompute({ ...currentConfig(), queryParams: nextQueryParams }, format);
  };

  const removeQueryParam = (id: string) => {
    const nextQueryParams = queryParams.filter((row) => row.id !== id);
    setQueryParams(nextQueryParams);
    recompute({ ...currentConfig(), queryParams: nextQueryParams }, format);
  };

  const addHeader = () => {
    const nextHeaders = [...headers, createEmptyKeyValuePair()];
    setHeaders(nextHeaders);
    recompute({ ...currentConfig(), headers: nextHeaders }, format);
  };

  const updateHeader = (id: string, patch: Partial<KeyValuePair>) => {
    const nextHeaders = headers.map((row) => (row.id === id ? { ...row, ...patch } : row));
    setHeaders(nextHeaders);
    recompute({ ...currentConfig(), headers: nextHeaders }, format);
  };

  const removeHeader = (id: string) => {
    const nextHeaders = headers.filter((row) => row.id !== id);
    setHeaders(nextHeaders);
    recompute({ ...currentConfig(), headers: nextHeaders }, format);
  };

  const handleClear = () => {
    const cleared: CurlRequestConfig = {
      method: 'GET',
      url: '',
      queryParams: [createEmptyKeyValuePair()],
      headers: [createEmptyKeyValuePair()],
      body: '',
    };
    setMethodState(cleared.method);
    setUrlState(cleared.url);
    setQueryParams(cleared.queryParams);
    setHeaders(cleared.headers);
    setBodyState(cleared.body);
    recompute(cleared, format);
  };

  return {
    method,
    setMethod,
    url,
    setUrl,
    queryParams,
    addQueryParam,
    updateQueryParam,
    removeQueryParam,
    headers,
    addHeader,
    updateHeader,
    removeHeader,
    body,
    setBody,
    format,
    setFormat,
    result,
    handleClear,
  };
};
