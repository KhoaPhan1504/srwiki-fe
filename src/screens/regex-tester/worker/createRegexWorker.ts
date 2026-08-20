export const createRegexWorker = (): Worker =>
  new Worker(new URL('./regexMatcher.worker.ts', import.meta.url), { type: 'module' });
