import type { ErrorCodes } from '~root/constants';

export type HeaderEntry = {
  name: string;
  value: string;
};

export type HeaderCategory = 'content' | 'caching' | 'cors' | 'security' | 'server';

// Mirrors the backend's HeaderInspectionResponse (app/schemas.py), already
// camelCased by the API's CamelModel serialization.
export type HeaderInspectionResponse = {
  statusCode: number;
  reasonPhrase: string;
  headers: HeaderEntry[];
  finalUrl: string;
  redirectCount: number;
  durationMs: number;
  httpVersion: string;
};

export type HeaderInspectionError = { code: ErrorCodes; message: string };

export type HeaderInspectionStatus = 'idle' | 'sending' | 'success' | 'error';
