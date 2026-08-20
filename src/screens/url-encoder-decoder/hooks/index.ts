import { useState } from 'react';
import { ErrorCodes, OperationMode } from '~root/constants';
import type { UrlEncodeDecodeError } from '~root/types';
import { decodeUrl, encodeUrl } from '~root/utils';

export const useUrlEncoderDecoderHooks = () => {
  const [mode, setModeState] = useState<OperationMode>(OperationMode.ENCODE);
  const [input, setInputState] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<UrlEncodeDecodeError | null>(null);

  const convert = (value: string, currentMode: OperationMode) => {
    const result = currentMode === OperationMode.ENCODE ? encodeUrl(value) : decodeUrl(value);
    if (result.success) {
      setOutput(result.output);
      setError(null);
    } else if (result.error.code === ErrorCodes.EMPTY_INPUT) {
      setOutput('');
      setError(null);
    } else {
      setOutput('');
      setError(result.error);
    }
  };

  const setInput = (value: string) => {
    setInputState(value);
    convert(value, mode);
  };

  const setMode = (nextMode: OperationMode) => {
    setModeState(nextMode);
    convert(input, nextMode);
  };

  const handleClear = () => {
    setInputState('');
    setOutput('');
    setError(null);
  };

  return { mode, setMode, input, setInput, output, error, handleClear };
};
