import { CircleX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ErrorCodes } from '~root/constants';
import type { RestClientError } from '~root/types';

const ERROR_MESSAGE_KEYS: Partial<Record<ErrorCodes, string>> = {
  [ErrorCodes.EMPTY_INPUT]: 'errors.emptyInput',
  [ErrorCodes.INVALID_URL]: 'errors.invalidUrl',
  [ErrorCodes.INVALID_JSON_BODY]: 'errors.invalidJsonBody',
  [ErrorCodes.INVALID_HEADER_KEY]: 'errors.invalidHeaderKey',
  [ErrorCodes.NETWORK_ERROR]: 'errors.networkError',
  [ErrorCodes.REQUEST_TIMEOUT]: 'errors.requestTimeout',
  [ErrorCodes.REQUEST_ABORTED]: 'errors.requestAborted',
};

type Props = {
  error: RestClientError;
};

export const RequestErrorBanner = ({ error }: Props) => {
  const { t } = useTranslation('rest-api-client');
  const messageKey = ERROR_MESSAGE_KEYS[error.code] ?? 'errors.networkError';

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm"
    >
      <CircleX className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      <p className="text-destructive">{t(messageKey)}</p>
    </div>
  );
};
