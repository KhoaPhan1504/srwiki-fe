import {
  ABSOLUTE_ZERO_BY_UNIT,
  DATA_UNIT_BYTE_FACTORS,
  DATA_UNITS,
  DEFAULT_BASE_FONT_SIZE_PX,
  ErrorCodes,
  LENGTH_UNIT_PX_FACTORS,
  LENGTH_UNITS,
  TEMPERATURE_UNITS,
  TIME_UNIT_MS_FACTORS,
  TIME_UNITS,
  UnitCategory,
} from '~root/constants';
import type {
  DataConversionResult,
  DataUnit,
  LengthConversionResult,
  LengthUnit,
  TemperatureConversionResult,
  TemperatureUnit,
  TimeConversionResult,
  TimeUnit,
  UnitOption,
} from '~root/types';

const MAX_DECIMAL_PLACES = 6;

export const formatUnitValue = (value: number): string => {
  const rounded = Number(value.toFixed(MAX_DECIMAL_PLACES));
  return rounded.toString();
};

type NumericInput = { valid: true; value: number } | { valid: false; code: ErrorCodes };

const parseNumericInput = (input: string): NumericInput => {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, code: ErrorCodes.EMPTY_INPUT };

  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { valid: false, code: ErrorCodes.INVALID_NUMBER };

  return { valid: true, value };
};

const errorResult = <C extends UnitCategory>(category: C, code: ErrorCodes) => ({
  success: false as const,
  category,
  error: { code, message: '' },
});

const buildUnitValues = <U extends string>(
  units: UnitOption<U>[],
  toValue: (unit: U) => number,
): Record<U, number> =>
  units.reduce(
    (acc, { value: unit }) => {
      acc[unit] = toValue(unit);
      return acc;
    },
    {} as Record<U, number>,
  );

const pxPerLengthUnit = (unit: LengthUnit, baseFontSizePx: number): number =>
  unit === 'rem' || unit === 'em' ? baseFontSizePx : LENGTH_UNIT_PX_FACTORS[unit];

export const convertLength = (
  input: string,
  fromUnit: LengthUnit,
  baseFontSizePx: number = DEFAULT_BASE_FONT_SIZE_PX,
): LengthConversionResult => {
  const parsed = parseNumericInput(input);
  if (!parsed.valid) return errorResult(UnitCategory.LENGTH, parsed.code);

  if (!Number.isFinite(baseFontSizePx) || baseFontSizePx <= 0) {
    return errorResult(UnitCategory.LENGTH, ErrorCodes.INVALID_NUMBER);
  }

  const px = parsed.value * pxPerLengthUnit(fromUnit, baseFontSizePx);
  const values = buildUnitValues(
    LENGTH_UNITS,
    (unit) => px / pxPerLengthUnit(unit, baseFontSizePx),
  );

  return { success: true, category: UnitCategory.LENGTH, values };
};

const toCelsius = (value: number, unit: TemperatureUnit): number => {
  switch (unit) {
    case 'C':
      return value;
    case 'F':
      return ((value - 32) * 5) / 9;
    case 'K':
      return value - 273.15;
  }
};

const fromCelsius = (celsius: number, unit: TemperatureUnit): number => {
  switch (unit) {
    case 'C':
      return celsius;
    case 'F':
      return (celsius * 9) / 5 + 32;
    case 'K':
      return celsius + 273.15;
  }
};

export const convertTemperature = (
  input: string,
  fromUnit: TemperatureUnit,
): TemperatureConversionResult => {
  const parsed = parseNumericInput(input);
  if (!parsed.valid) return errorResult(UnitCategory.TEMPERATURE, parsed.code);

  if (parsed.value < ABSOLUTE_ZERO_BY_UNIT[fromUnit]) {
    return errorResult(UnitCategory.TEMPERATURE, ErrorCodes.BELOW_ABSOLUTE_ZERO);
  }

  const celsius = toCelsius(parsed.value, fromUnit);
  const values = buildUnitValues(TEMPERATURE_UNITS, (unit) => fromCelsius(celsius, unit));

  return { success: true, category: UnitCategory.TEMPERATURE, values };
};

export const convertTime = (input: string, fromUnit: TimeUnit): TimeConversionResult => {
  const parsed = parseNumericInput(input);
  if (!parsed.valid) return errorResult(UnitCategory.TIME, parsed.code);

  const ms = parsed.value * TIME_UNIT_MS_FACTORS[fromUnit];
  const values = buildUnitValues(TIME_UNITS, (unit) => ms / TIME_UNIT_MS_FACTORS[unit]);

  return { success: true, category: UnitCategory.TIME, values };
};

export const convertData = (input: string, fromUnit: DataUnit): DataConversionResult => {
  const parsed = parseNumericInput(input);
  if (!parsed.valid) return errorResult(UnitCategory.DATA, parsed.code);

  if (parsed.value < 0) {
    return errorResult(UnitCategory.DATA, ErrorCodes.NEGATIVE_NOT_ALLOWED);
  }

  const bytes = parsed.value * DATA_UNIT_BYTE_FACTORS[fromUnit];
  const values = buildUnitValues(DATA_UNITS, (unit) => bytes / DATA_UNIT_BYTE_FACTORS[unit]);

  return { success: true, category: UnitCategory.DATA, values };
};
