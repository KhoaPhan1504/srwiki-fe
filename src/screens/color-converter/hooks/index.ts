import { useState } from 'react';
import { ErrorCodes } from '~root/constants';
import type { ColorConversionResult } from '~root/types';
import { parseColor } from '~root/utils';

export const useColorConverterHooks = () => {
  const [input, setInputState] = useState('');
  const [result, setResult] = useState<ColorConversionResult | null>(null);

  const convert = (value: string) => {
    const nextResult = parseColor(value);
    setResult(
      !nextResult.success && nextResult.error.code === ErrorCodes.EMPTY_INPUT ? null : nextResult,
    );
  };

  const setInput = (value: string) => {
    setInputState(value);
    convert(value);
  };

  const handleClear = () => {
    setInputState('');
    setResult(null);
  };

  return { input, setInput, result, handleClear };
};
