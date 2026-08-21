import type { ErrorCodes } from '~root/constants';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type KeyValuePair = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

export type AuthConfig =
  | { type: 'none' }
  | { type: 'bearer'; token: string }
  | { type: 'basic'; username: string; password: string }
  | { type: 'apiKey'; key: string; value: string; addTo: 'header' | 'query' };

export type BodyType = 'raw' | 'urlEncoded' | 'formData';

export type RestRequestConfig = {
  method: HttpMethod;
  url: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  bodyType: BodyType;
  bodyFields: KeyValuePair[];
  auth: AuthConfig;
};

export type RestClientError = { code: ErrorCodes; message: string };

export type RestResponseBody =
  { isJson: true; json: unknown; text: string } | { isJson: false; text: string };

export type RestResponse = {
  status: number;
  statusText: string;
  ok: boolean;
  headers: Record<string, string>;
  durationMs: number;
  sizeBytes: number;
  body: RestResponseBody;
};

export type RestClientResult =
  { success: true; response: RestResponse } | { success: false; error: RestClientError };

export type RestClientStatus = 'idle' | 'sending' | 'success' | 'error';

export type SavedRequest = {
  id: string;
  collectionId: string;
  name: string;
  method: HttpMethod;
  url: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  bodyType: BodyType;
  bodyFields: KeyValuePair[];
  auth: AuthConfig;
  createdAt: string;
  updatedAt: string;
};

export type Collection = {
  id: string;
  name: string;
  createdAt: string;
  requests: SavedRequest[];
};

export type Environment = {
  id: string;
  name: string;
  variables: KeyValuePair[];
  createdAt: string;
  updatedAt: string;
};
