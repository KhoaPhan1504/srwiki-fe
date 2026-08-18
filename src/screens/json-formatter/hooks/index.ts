import { useState } from 'react';
import { formatJson, minifyJson, validateJson } from '../utils';
import type { IndentOption, JsonParseError, ValidateResult } from '../utils';

type Status = 'idle' | 'valid' | 'invalid';

export const useJsonFormatterHooks = () => {
  const [input, setInputValue] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<IndentOption>(2);
  const [error, setError] = useState<JsonParseError | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const applyValidation = (result: ValidateResult) => {
    if (result.success) {
      setError(null);
      setStatus('valid');
    } else if (result.error.code === 'EMPTY_INPUT') {
      setError(null);
      setStatus('idle');
    } else {
      setError(result.error);
      setStatus('invalid');
    }
  };

  const setInput = (value: string) => {
    setInputValue(value);
    setError(null);
    setStatus('idle');
  };

  const handleFileLoaded = (content: string) => {
    setInputValue(content);
    setOutput('');
    applyValidation(validateJson(content));
  };

  const handleFormat = () => {
    const result = formatJson(input, indent);
    if (result.success) {
      setOutput(result.output);
    } else {
      setOutput('');
    }
    applyValidation(result);
  };

  const handleMinify = () => {
    const result = minifyJson(input);
    if (result.success) {
      setOutput(result.output);
    } else {
      setOutput('');
    }
    applyValidation(result);
  };

  const handleValidate = () => applyValidation(validateJson(input));

  const handleClear = () => {
    setInputValue('');
    setOutput('');
    setError(null);
    setStatus('idle');
  };

  return {
    input,
    setInput,
    output,
    indent,
    setIndent,
    error,
    status,
    handleFormat,
    handleMinify,
    handleValidate,
    handleFileLoaded,
    handleClear,
  };
};
