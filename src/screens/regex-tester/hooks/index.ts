import { useEffect, useRef, useState } from 'react';
import { createRegex } from '~root/utils';
import { createRegexWorker } from '../worker';
import { DEBOUNCE_MS, ProcessingStatus, WORKER_TIMEOUT_MS } from '~root/constants';
import type {
  RegexError,
  RegexExample,
  RegexMatch,
  WorkerRequest,
  WorkerResponse,
} from '~root/types';
import { useDebounce } from '~root/hooks';

export const useRegexTester = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [replacement, setReplacement] = useState('');

  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [replacePreview, setReplacePreview] = useState('');
  const [execStatus, setExecStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [execErrorMessage, setExecErrorMessage] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const workerRef = useRef<Worker | null>(null);
  const watchdogRef = useRef<number | null>(null);

  const syntaxResult = createRegex(pattern, flags);
  const syntaxError: RegexError | null = syntaxResult.success ? null : syntaxResult.error;

  const debouncedPattern = useDebounce(pattern, DEBOUNCE_MS);
  const debouncedFlags = useDebounce(flags, DEBOUNCE_MS);
  const debouncedTestString = useDebounce(testString, DEBOUNCE_MS);
  const debouncedReplacement = useDebounce(replacement, DEBOUNCE_MS);

  // Whether the debounced inputs are currently eligible to drive the worker.
  // Derived at render time (not stored+reset via setState-in-effect) so that
  // becoming ineligible (pattern/testString cleared, or pattern turned
  // invalid) instantly hides any stale result without an extra render pass.
  const debouncedValidation = createRegex(debouncedPattern, debouncedFlags);
  const canExecute = Boolean(
    debouncedPattern && debouncedTestString && debouncedValidation.success,
  );

  const clearWatchdog = () => {
    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  };

  const terminateWorker = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
  };

  useEffect(() => {
    clearWatchdog();
    terminateWorker();

    if (!debouncedPattern || !debouncedTestString) return;

    const validation = createRegex(debouncedPattern, debouncedFlags);
    if (!validation.success) return;

    const requestId = (requestIdRef.current += 1);
    const worker = createRegexWorker();
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      // workerRef.current !== worker catches a response delivered after this
      // worker was already terminated (e.g. by the watchdog) — real browsers
      // stop delivering messages from a terminated Worker, but this guard
      // keeps the hook correct even if that isn't perfectly synchronous.
      if (workerRef.current !== worker || event.data.requestId !== requestIdRef.current) return;
      clearWatchdog();
      terminateWorker();
      if (event.data.ok) {
        setMatches(event.data.matches);
        setTruncated(event.data.truncated);
        setReplacePreview(event.data.replacePreview);
        setExecStatus(ProcessingStatus.DONE);
        setExecErrorMessage(null);
      } else {
        setExecStatus(ProcessingStatus.ERROR);
        setExecErrorMessage(event.data.error);
      }
    };

    const request: WorkerRequest = {
      requestId,
      pattern: debouncedPattern,
      flags: debouncedFlags,
      testString: debouncedTestString,
      replacement: debouncedReplacement,
    };
    worker.postMessage(request);

    watchdogRef.current = window.setTimeout(() => {
      if (requestId !== requestIdRef.current) return;
      terminateWorker();
      setExecStatus(ProcessingStatus.TIMEOUT);
      setExecErrorMessage(null);
      watchdogRef.current = null;
    }, WORKER_TIMEOUT_MS);

    return () => {
      clearWatchdog();
    };
  }, [debouncedPattern, debouncedFlags, debouncedTestString, debouncedReplacement]);

  useEffect(() => {
    return () => {
      clearWatchdog();
      terminateWorker();
    };
  }, []);

  const toggleFlag = (flag: string) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));
  };

  const loadExample = (example: Pick<RegexExample, 'pattern' | 'flags' | 'sampleText'>) => {
    setPattern(example.pattern);
    setFlags(example.flags);
    setTestString(example.sampleText);
  };

  const handleReplaceAll = () => {
    setTestString(replacePreview);
  };

  const handleClear = () => {
    terminateWorker();
    clearWatchdog();
    setPattern('');
    setFlags('g');
    setTestString('');
    setReplacement('');
    setMatches([]);
    setTruncated(false);
    setReplacePreview('');
    setExecStatus(ProcessingStatus.IDLE);
    setExecErrorMessage(null);
  };

  return {
    pattern,
    setPattern,
    flags,
    toggleFlag,
    testString,
    setTestString,
    replacement,
    setReplacement,
    syntaxError,
    matches: canExecute ? matches : [],
    truncated: canExecute ? truncated : false,
    replacePreview: canExecute ? replacePreview : '',
    execStatus: canExecute ? execStatus : 'idle',
    execErrorMessage: canExecute ? execErrorMessage : null,
    loadExample,
    handleReplaceAll,
    handleClear,
  };
};
