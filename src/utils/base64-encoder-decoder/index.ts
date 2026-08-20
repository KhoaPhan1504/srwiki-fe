import { ErrorCodes } from '~root/constants';

export type Base64Mode = 'encode' | 'decode';

export type Base64Error = { code: ErrorCodes; message: string };

export type Base64Result =
  { success: true; output: string } | { success: false; error: Base64Error };

const emptyInputError = (): Base64Result => ({
  success: false,
  error: { code: ErrorCodes.EMPTY_INPUT, message: '' },
});

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

export const encodeBase64 = (input: string): Base64Result => {
  if (!input) return emptyInputError();

  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return { success: true, output: btoa(binary) };
};

export const decodeBase64 = (input: string): Base64Result => {
  const withoutWhitespace = input.replace(/\s+/g, '');
  if (!withoutWhitespace) return emptyInputError();

  const withoutPadding = withoutWhitespace.replace(/=+$/, '');
  const paddingNeeded = (4 - (withoutPadding.length % 4)) % 4;
  const normalized = withoutPadding + '='.repeat(paddingNeeded);

  try {
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return { success: true, output: new TextDecoder().decode(bytes) };
  } catch (err) {
    return {
      success: false,
      error: { code: ErrorCodes.INVALID_BASE64, message: errorMessage(err) },
    };
  }
};
