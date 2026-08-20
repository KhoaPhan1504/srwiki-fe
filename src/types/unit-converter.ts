import type { ErrorCodes, UnitCategory } from '~root/constants';

export type UnitConverterError = { code: ErrorCodes; message: string };

export type UnitOption<T extends string> = { value: T; labelKey: string };

export type LengthUnit = 'px' | 'rem' | 'em' | 'pt' | 'cm' | 'mm' | 'in';
export type DataUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB';
export type TimeUnit = 'ms' | 's' | 'min' | 'h' | 'day';
export type TemperatureUnit = 'C' | 'F' | 'K';

export type LengthConversionResult =
  | { success: true; category: UnitCategory.LENGTH; values: Record<LengthUnit, number> }
  | { success: false; category: UnitCategory.LENGTH; error: UnitConverterError };

export type DataConversionResult =
  | { success: true; category: UnitCategory.DATA; values: Record<DataUnit, number> }
  | { success: false; category: UnitCategory.DATA; error: UnitConverterError };

export type TimeConversionResult =
  | { success: true; category: UnitCategory.TIME; values: Record<TimeUnit, number> }
  | { success: false; category: UnitCategory.TIME; error: UnitConverterError };

export type TemperatureConversionResult =
  | { success: true; category: UnitCategory.TEMPERATURE; values: Record<TemperatureUnit, number> }
  | { success: false; category: UnitCategory.TEMPERATURE; error: UnitConverterError };

export type UnitConversionResult =
  | LengthConversionResult
  | DataConversionResult
  | TimeConversionResult
  | TemperatureConversionResult;
