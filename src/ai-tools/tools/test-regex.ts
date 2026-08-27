import { z } from 'zod';
import { createRegex } from '~root/utils/regex-tester';
import { createRegexWorker } from '~root/screens/regex-tester/worker';
import { WORKER_TIMEOUT_MS } from '~root/constants';
import type { RegexMatch, WorkerRequest, WorkerResponse } from '~root/types';
import type { ToolDefinition, ToolResult } from '../types';

const inputSchema = z.object({
  pattern: z.string(),
  flags: z.string(),
  testString: z.string(),
});

type TestRegexInput = z.infer<typeof inputSchema>;
type TestRegexOutput = { matches: RegexMatch[]; truncated: boolean };

export const testRegexTool: ToolDefinition<TestRegexInput, TestRegexOutput> = {
  name: 'test_regex',
  description:
    'Test a regular expression against a string and return all matches. Runs on a worker with a timeout, so a pathological pattern (catastrophic backtracking) fails safely instead of hanging.',
  inputSchema,
  metadata: { category: 'testing', readOnly: true, requiresNetwork: false },
  execute: ({ pattern, flags, testString }) => {
    // Compiling a pattern never backtracks (only executing/matching can) — validate
    // it synchronously on the caller's thread before ever spinning up a worker.
    const syntax = createRegex(pattern, flags);
    if (!syntax.success) {
      return {
        success: false,
        error: { category: 'validation', message: syntax.error.message },
      };
    }

    return new Promise<ToolResult<TestRegexOutput>>((resolve) => {
      const worker = createRegexWorker();
      let settled = false;

      const finish = (result: ToolResult<TestRegexOutput>) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(watchdog);
        worker.terminate();
        resolve(result);
      };

      const watchdog = window.setTimeout(() => {
        finish({
          success: false,
          error: {
            category: 'execution',
            message: 'Regex execution timed out (possible catastrophic backtracking).',
            code: 'TIMEOUT',
          },
        });
      }, WORKER_TIMEOUT_MS);

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (!event.data.ok) {
          finish({
            success: false,
            error: { category: 'internal', message: 'Unexpected failure while processing input.' },
          });
          return;
        }
        finish({
          success: true,
          data: { matches: event.data.matches, truncated: event.data.truncated },
        });
      };

      const request: WorkerRequest = { requestId: 0, pattern, flags, testString, replacement: '' };
      worker.postMessage(request);
    });
  },
};
