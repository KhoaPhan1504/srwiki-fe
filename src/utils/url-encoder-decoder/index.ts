import { ErrorCodes } from '~root/constants';
import type { UrlEncodeDecodeResult } from '~root/types';

const emptyInputError = (): UrlEncodeDecodeResult => ({
  success: false,
  error: { code: ErrorCodes.EMPTY_INPUT, message: '' },
});

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

export const encodeUrl = (input: string): UrlEncodeDecodeResult => {
  if (!input) return emptyInputError();

  return { success: true, output: encodeURIComponent(input) };
};

export const decodeUrl = (input: string): UrlEncodeDecodeResult => {
  if (!input) return emptyInputError();

  try {
    return { success: true, output: decodeURIComponent(input) };
  } catch (err) {
    return {
      success: false,
      error: { code: ErrorCodes.INVALID_URI_ENCODING, message: errorMessage(err) },
    };
  }
};
