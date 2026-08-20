import { useState } from 'react';
import { DEFAULT_BASE_FONT_SIZE_PX, ErrorCodes, UnitCategory } from '~root/constants';
import type {
  DataUnit,
  LengthUnit,
  TemperatureUnit,
  TimeUnit,
  UnitConversionResult,
} from '~root/types';
import { convertData, convertLength, convertTemperature, convertTime } from '~root/utils';

const DEFAULT_UNIT_BY_CATEGORY: Record<UnitCategory, string> = {
  [UnitCategory.LENGTH]: 'px',
  [UnitCategory.DATA]: 'B',
  [UnitCategory.TIME]: 'ms',
  [UnitCategory.TEMPERATURE]: 'C',
};

const convert = (
  category: UnitCategory,
  value: string,
  unit: string,
  baseFontSizePx: string,
): UnitConversionResult => {
  switch (category) {
    case UnitCategory.LENGTH:
      return convertLength(value, unit as LengthUnit, Number(baseFontSizePx));
    case UnitCategory.DATA:
      return convertData(value, unit as DataUnit);
    case UnitCategory.TIME:
      return convertTime(value, unit as TimeUnit);
    case UnitCategory.TEMPERATURE:
      return convertTemperature(value, unit as TemperatureUnit);
  }
};

export const useUnitConverterHooks = () => {
  const [category, setCategoryState] = useState<UnitCategory>(UnitCategory.LENGTH);
  const [unit, setUnitState] = useState<string>(DEFAULT_UNIT_BY_CATEGORY[UnitCategory.LENGTH]);
  const [input, setInputState] = useState('');
  const [baseFontSizePx, setBaseFontSizePxState] = useState(String(DEFAULT_BASE_FONT_SIZE_PX));
  const [result, setResult] = useState<UnitConversionResult | null>(null);

  const runConversion = (
    currentCategory: UnitCategory,
    value: string,
    currentUnit: string,
    currentBaseFontSizePx: string,
  ) => {
    const nextResult = convert(currentCategory, value, currentUnit, currentBaseFontSizePx);
    setResult(
      !nextResult.success && nextResult.error.code === ErrorCodes.EMPTY_INPUT ? null : nextResult,
    );
  };

  const setInput = (value: string) => {
    setInputState(value);
    runConversion(category, value, unit, baseFontSizePx);
  };

  const setCategory = (nextCategory: UnitCategory) => {
    const nextUnit = DEFAULT_UNIT_BY_CATEGORY[nextCategory];
    setCategoryState(nextCategory);
    setUnitState(nextUnit);
    setInputState('');
    setResult(null);
  };

  const setUnit = (nextUnit: string) => {
    setUnitState(nextUnit);
    runConversion(category, input, nextUnit, baseFontSizePx);
  };

  const setBaseFontSizePx = (value: string) => {
    setBaseFontSizePxState(value);
    runConversion(category, input, unit, value);
  };

  const handleClear = () => {
    setInputState('');
    setResult(null);
  };

  return {
    category,
    setCategory,
    unit,
    setUnit,
    input,
    setInput,
    baseFontSizePx,
    setBaseFontSizePx,
    result,
    handleClear,
  };
};
