import type { ErrorCodes } from '~root/constants';

export type UrlEncodeDecodeError = { code: ErrorCodes; message: string };

export type UrlEncodeDecodeResult =
  { success: true; output: string } | { success: false; error: UrlEncodeDecodeError };
