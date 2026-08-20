import { useState } from 'react';
import { ErrorCodes } from '~root/constants';
import { decodeBase64, encodeBase64 } from '~root/utils';
import type { Base64Error, Base64Mode } from '~root/utils';

export const useBase64EncoderDecoderHooks = () => {
  const [mode, setModeState] = useState<Base64Mode>('encode');
  const [input, setInputState] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<Base64Error | null>(null);

  const convert = (value: string, currentMode: Base64Mode) => {
    const result = currentMode === 'encode' ? encodeBase64(value) : decodeBase64(value);
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

  const setMode = (nextMode: Base64Mode) => {
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
