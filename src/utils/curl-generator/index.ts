import { ErrorCodes, HEADER_NAME_PATTERN, METHODS_WITHOUT_BODY } from '~root/constants';
import type {
  CurlCommandFormat,
  CurlGenerationResult,
  CurlGeneratorError,
  CurlRequestConfig,
} from '~root/types';
import type { HttpMethod, KeyValuePair } from '~root/types/rest-api-client';
import { buildUrlWithParams } from '~root/utils/rest-api-client';
import { shellEscapeSingleQuote } from './shell-escape';

export const validateCurlRequest = (config: CurlRequestConfig): CurlGeneratorError | null => {
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

  return null;
};

const buildHeaderArgs = (headers: KeyValuePair[]): string[] =>
  headers
    .filter((header) => header.enabled && header.key.trim() !== '')
    .map((header) => `-H ${shellEscapeSingleQuote(`${header.key.trim()}: ${header.value}`)}`);

const buildBodyArg = (method: HttpMethod, body: string): string | null => {
  if (METHODS_WITHOUT_BODY.includes(method)) return null;
  if (body.trim() === '') return null;
  return `-d ${shellEscapeSingleQuote(body)}`;
};

const assembleCommand = (
  firstLine: string,
  continuationArgs: string[],
  format: CurlCommandFormat,
): string => {
  if (format === 'singleLine') {
    return [firstLine, ...continuationArgs].join(' ');
  }

  const lines = [firstLine, ...continuationArgs.map((arg) => `  ${arg}`)];
  return lines.map((line, index) => (index < lines.length - 1 ? `${line} \\` : line)).join('\n');
};

export const generateCurlCommand = (
  config: CurlRequestConfig,
  format: CurlCommandFormat,
): CurlGenerationResult => {
  const validationError = validateCurlRequest(config);
  if (validationError) return { success: false, error: validationError };

  const url = buildUrlWithParams(config.url, config.queryParams);
  const firstLine = `curl -X ${config.method} ${shellEscapeSingleQuote(url)}`;
  const bodyArg = buildBodyArg(config.method, config.body);
  const continuationArgs = [...buildHeaderArgs(config.headers), ...(bodyArg ? [bodyArg] : [])];

  return { success: true, command: assembleCommand(firstLine, continuationArgs, format) };
};
