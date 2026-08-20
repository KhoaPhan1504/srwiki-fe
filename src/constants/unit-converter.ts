import type { DataUnit, LengthUnit, TemperatureUnit, TimeUnit, UnitOption } from '~root/types';

export const DEFAULT_BASE_FONT_SIZE_PX = 16;

// rem/em scale with the base font size at conversion time, so they have no fixed px factor here.
export const LENGTH_UNIT_PX_FACTORS: Record<Exclude<LengthUnit, 'rem' | 'em'>, number> = {
  px: 1,
  pt: 96 / 72,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
};

export const LENGTH_UNITS: UnitOption<LengthUnit>[] = [
  { value: 'px', labelKey: 'units.px' },
  { value: 'rem', labelKey: 'units.rem' },
  { value: 'em', labelKey: 'units.em' },
  { value: 'pt', labelKey: 'units.pt' },
  { value: 'cm', labelKey: 'units.cm' },
  { value: 'mm', labelKey: 'units.mm' },
  { value: 'in', labelKey: 'units.in' },
];

export const DATA_UNIT_BYTE_FACTORS: Record<DataUnit, number> = {
  B: 1,
  KB: 1_000,
  MB: 1_000_000,
  GB: 1_000_000_000,
  TB: 1_000_000_000_000,
};

export const DATA_UNITS: UnitOption<DataUnit>[] = [
  { value: 'B', labelKey: 'units.B' },
  { value: 'KB', labelKey: 'units.KB' },
  { value: 'MB', labelKey: 'units.MB' },
  { value: 'GB', labelKey: 'units.GB' },
  { value: 'TB', labelKey: 'units.TB' },
];

export const TIME_UNIT_MS_FACTORS: Record<TimeUnit, number> = {
  ms: 1,
  s: 1_000,
  min: 60_000,
  h: 3_600_000,
  day: 86_400_000,
};

export const TIME_UNITS: UnitOption<TimeUnit>[] = [
  { value: 'ms', labelKey: 'units.ms' },
  { value: 's', labelKey: 'units.s' },
  { value: 'min', labelKey: 'units.min' },
  { value: 'h', labelKey: 'units.h' },
  { value: 'day', labelKey: 'units.day' },
];

export const ABSOLUTE_ZERO_BY_UNIT: Record<TemperatureUnit, number> = {
  C: -273.15,
  F: -459.67,
  K: 0,
};

export const TEMPERATURE_UNITS: UnitOption<TemperatureUnit>[] = [
  { value: 'C', labelKey: 'units.C' },
  { value: 'F', labelKey: 'units.F' },
  { value: 'K', labelKey: 'units.K' },
];

// Keyed by the UnitCategory enum's underlying string values (not the enum itself,
// to avoid a circular import: this file is re-exported from constants/index.ts,
// which is where UnitCategory is declared).
export const UNIT_OPTIONS_BY_CATEGORY: Record<string, UnitOption<string>[]> = {
  length: LENGTH_UNITS,
  data: DATA_UNITS,
  time: TIME_UNITS,
  temperature: TEMPERATURE_UNITS,
};
