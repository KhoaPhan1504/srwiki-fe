import { useState } from 'react';
import { ErrorCodes, ProcessingStatus } from '~root/constants';
import {
  formatJson,
  minifyJson,
  validateJson,
  type IndentOption,
  type JsonParseError,
  type ValidateResult,
} from '~root/utils';

export const useJsonFormatterHooks = () => {
  const [input, setInputValue] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<IndentOption>(2);
  const [error, setError] = useState<JsonParseError | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);

  const applyValidation = (result: ValidateResult) => {
    if (result.success) {
      setError(null);
      setStatus(ProcessingStatus.VALID);
    } else if (result.error.code === ErrorCodes.EMPTY_INPUT) {
      setError(null);
      setStatus(ProcessingStatus.IDLE);
    } else {
      setError(result.error);
      setStatus(ProcessingStatus.INVALID);
    }
  };

  const setInput = (value: string) => {
    setInputValue(value);
    setError(null);
    setStatus(ProcessingStatus.IDLE);
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
    setStatus(ProcessingStatus.IDLE);
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
