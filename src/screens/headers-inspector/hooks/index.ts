import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useInspectHeaders } from '~root/apis/useInspectHeaders';
import { ErrorCodes } from '~root/constants';
import type {
  HeaderInspectionError,
  HeaderInspectionResponse,
  HeaderInspectionStatus,
} from '~root/types';

type BackendErrorDetail = { code?: string; message?: string };

// The backend's raw error `code` strings, mapped onto this app's existing
// ErrorCodes enum. CONNECTION_ERROR intentionally collapses onto the
// existing NETWORK_ERROR member rather than getting a new distinct code.
const BACKEND_ERROR_CODE_MAP: Record<string, ErrorCodes> = {
  INVALID_URL: ErrorCodes.INVALID_URL,
  BLOCKED_URL: ErrorCodes.BLOCKED_URL,
  CONNECTION_ERROR: ErrorCodes.NETWORK_ERROR,
  REQUEST_TIMEOUT: ErrorCodes.REQUEST_TIMEOUT,
  TOO_MANY_REDIRECTS: ErrorCodes.TOO_MANY_REDIRECTS,
};

const mapToHeaderInspectionError = (err: unknown): HeaderInspectionError => {
  const detail = axios.isAxiosError<{ detail?: BackendErrorDetail }>(err)
    ? err.response?.data?.detail
    : undefined;

  if (detail?.code) {
    return {
      code: BACKEND_ERROR_CODE_MAP[detail.code] ?? ErrorCodes.NETWORK_ERROR,
      message: detail.message ?? '',
    };
  }

  return {
    code: ErrorCodes.NETWORK_ERROR,
    message: err instanceof Error ? err.message : '',
  };
};

export const useHeadersInspectorHooks = () => {
  const [url, setUrl] = useState('');
  // The URL that was actually sent to produce the currently displayed
  // response/error — distinct from `url`, which keeps changing as the user
  // types in the input box even after a response has already been fetched.
  // Consumers that need to compare against the *displayed* response (e.g.
  // ResponseSummary's final-URL check) must use this, not `url`.
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [status, setStatus] = useState<HeaderInspectionStatus>('idle');
  const [response, setResponse] = useState<HeaderInspectionResponse | null>(null);
  const [error, setError] = useState<HeaderInspectionError | null>(null);

  const requestIdRef = useRef(0);
  const { mutateAsync } = useInspectHeaders();

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  const handleSend = async () => {
    const requestId = (requestIdRef.current += 1);
    const requestedUrl = url;

    setStatus('sending');
    setSubmittedUrl(requestedUrl);
    setResponse(null);
    setError(null);

    try {
      const result = await mutateAsync(requestedUrl);
      if (requestId !== requestIdRef.current) return;
      setStatus('success');
      setResponse(result);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setStatus('error');
      setError(mapToHeaderInspectionError(err));
    }
  };

  const handleClear = () => {
    requestIdRef.current += 1;
    setUrl('');
    setSubmittedUrl('');
    setStatus('idle');
    setResponse(null);
    setError(null);
  };

  return {
    url,
    setUrl,
    submittedUrl,
    status,
    response,
    error,
    handleSend,
    handleClear,
  };
};
