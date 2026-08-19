import { ErrorCodes, ValidationReason } from '~root/constants';
import i18n from '~root/i18n';

export type IndentOption = 2 | 4 | 'tab';

export type JsonParseError = {
  code: ErrorCodes;
  message: string;
  line?: number;
  column?: number;
};

export type JsonResult =
  { success: true; output: string } | { success: false; error: JsonParseError };

type ParsedInput = { success: true; data: unknown } | { success: false; error: JsonParseError };

const locateError = (input: string, message: string): { line: number; column: number } => {
  const positionMatch = message.match(/position (\d+)/);
  const position = positionMatch ? Number(positionMatch[1]) : input.length;
  const before = input.slice(0, position).split('\n');
  return { line: before.length, column: before[before.length - 1].length + 1 };
};

const parseInput = (input: string): ParsedInput => {
  if (!input.trim()) {
    return { success: false, error: { code: ErrorCodes.EMPTY_INPUT, message: '' } };
  }
  try {
    return { success: true, data: JSON.parse(input) };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : i18n.t('common:errorMessages.invalidJsonFallback');
    return {
      success: false,
      error: { code: ErrorCodes.PARSE_ERROR, message, ...locateError(input, message) },
    };
  }
};

export const formatJson = (input: string, indent: IndentOption): JsonResult => {
  const parsed = parseInput(input);
  if (!parsed.success) return parsed;
  const indentArg = indent === 'tab' ? '\t' : indent;
  return { success: true, output: JSON.stringify(parsed.data, null, indentArg) };
};

export const minifyJson = (input: string): JsonResult => {
  const parsed = parseInput(input);
  if (!parsed.success) return parsed;
  return { success: true, output: JSON.stringify(parsed.data) };
};

export type ValidateResult = { success: true } | { success: false; error: JsonParseError };

export const validateJson = (input: string): ValidateResult => {
  const parsed = parseInput(input);
  if (!parsed.success) return parsed;
  return { success: true };
};

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

export type UploadFileInfo = { name: string; size: number; type: string };

export type UploadValidation =
  | { valid: true }
  | {
      valid: false;
      reason: ValidationReason.EMPTY | ValidationReason.TOO_LARGE | ValidationReason.INVALID_TYPE;
    };

export const validateUploadFile = (file: UploadFileInfo): UploadValidation => {
  const isJsonFile = file.name.toLowerCase().endsWith('.json') || file.type === 'application/json';
  if (!isJsonFile) return { valid: false, reason: ValidationReason.INVALID_TYPE };
  if (file.size === 0) return { valid: false, reason: ValidationReason.EMPTY };
  if (file.size > MAX_UPLOAD_SIZE_BYTES)
    return { valid: false, reason: ValidationReason.TOO_LARGE };
  return { valid: true };
};
