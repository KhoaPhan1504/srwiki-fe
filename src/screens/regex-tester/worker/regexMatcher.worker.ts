import type { WorkerRequest, WorkerResponse } from '~root/types';
import { getMatches, replaceMatches } from '~root/utils';

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { requestId, pattern, flags, testString, replacement } = event.data;
  try {
    const regex = new RegExp(pattern, flags);
    const { matches, truncated } = getMatches(regex, testString);
    const replacePreview = replaceMatches(regex, testString, replacement);
    postMessage({
      requestId,
      ok: true,
      matches,
      truncated,
      replacePreview,
    } satisfies WorkerResponse);
  } catch (err) {
    postMessage({ requestId, ok: false, error: String(err) } satisfies WorkerResponse);
  }
};
