import type { ErrorCodes } from '~root/constants';
import type { HttpMethod, KeyValuePair } from '~root/types/rest-api-client';

export type CurlRequestConfig = {
  method: HttpMethod;
  url: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
};

export type CurlCommandFormat = 'singleLine' | 'multiLine';

export type CurlGeneratorError = { code: ErrorCodes; message: string };

export type CurlGenerationResult =
  { success: true; command: string } | { success: false; error: CurlGeneratorError };
