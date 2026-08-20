import type { RegexFlag } from '~root/constants';

export interface FlagDefinition {
  flag: RegexFlag;
  labelKey: string;
  descriptionKey: string;
}

export interface RegexExample {
  id: string;
  labelKey: string;
  pattern: string;
  flags: string;
  sampleText: string;
}

export interface CheatsheetEntry {
  token: string;
  descriptionKey: string;
}

export interface RegexError {
  message: string;
}

export type CreateRegexResult =
  { success: true; regex: RegExp } | { success: false; error: RegexError };

export interface RegexMatch {
  index: number;
  length: number;
  value: string;
  groups: Array<string | undefined>;
  namedGroups?: Record<string, string | undefined>;
}

export interface GetMatchesResult {
  matches: RegexMatch[];
  truncated: boolean;
}

export interface WorkerRequest {
  requestId: number;
  pattern: string;
  flags: string;
  testString: string;
  replacement: string;
}

export type WorkerResponse =
  | {
      requestId: number;
      ok: true;
      matches: RegexMatch[];
      truncated: boolean;
      replacePreview: string;
    }
  | { requestId: number; ok: false; error: string };
