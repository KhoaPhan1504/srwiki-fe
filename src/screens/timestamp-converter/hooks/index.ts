import { useState } from 'react';
import { ErrorCodes, TimestampConversionMode, TimestampUnit } from '~root/constants';
import type { TimezoneMode } from '~root/constants';
import type { DateToTimestampResult, TimestampToDateResult } from '~root/types';
import { convertDateToTimestamp, convertTimestampToDate } from '~root/utils';

export const useTimestampConverterHooks = () => {
  const [mode, setModeState] = useState<TimestampConversionMode>(
    TimestampConversionMode.TIMESTAMP_TO_DATE,
  );
  const [unit, setUnitState] = useState<TimestampUnit>(TimestampUnit.SECONDS);
  const [timezoneMode, setTimezoneModeState] = useState<TimezoneMode>('local');
  const [input, setInputState] = useState('');
  const [timestampToDateResult, setTimestampToDateResult] = useState<TimestampToDateResult | null>(
    null,
  );
  const [dateToTimestampResult, setDateToTimestampResult] = useState<DateToTimestampResult | null>(
    null,
  );

  const convert = (
    value: string,
    currentMode: TimestampConversionMode,
    currentUnit: TimestampUnit,
    currentTimezoneMode: TimezoneMode,
  ) => {
    if (currentMode === TimestampConversionMode.TIMESTAMP_TO_DATE) {
      const result = convertTimestampToDate(value, currentUnit);
      setTimestampToDateResult(
        !result.success && result.error.code === ErrorCodes.EMPTY_INPUT ? null : result,
      );
      return;
    }

    const result = convertDateToTimestamp(value, currentTimezoneMode);
    setDateToTimestampResult(
      !result.success && result.error.code === ErrorCodes.EMPTY_INPUT ? null : result,
    );
  };

  const setInput = (value: string) => {
    setInputState(value);
    convert(value, mode, unit, timezoneMode);
  };

  const setMode = (nextMode: TimestampConversionMode) => {
    setModeState(nextMode);
    setInputState('');
    setTimestampToDateResult(null);
    setDateToTimestampResult(null);
  };

  const setUnit = (nextUnit: TimestampUnit) => {
    setUnitState(nextUnit);
    convert(input, mode, nextUnit, timezoneMode);
  };

  const setTimezoneMode = (nextTimezoneMode: TimezoneMode) => {
    setTimezoneModeState(nextTimezoneMode);
    convert(input, mode, unit, nextTimezoneMode);
  };

  const handleClear = () => {
    setInputState('');
    setTimestampToDateResult(null);
    setDateToTimestampResult(null);
  };

  return {
    mode,
    setMode,
    unit,
    setUnit,
    timezoneMode,
    setTimezoneMode,
    input,
    setInput,
    timestampToDateResult,
    dateToTimestampResult,
    handleClear,
  };
};
