import { SrDatePickerField } from '../DatePickerField';
import type { SrDateRangePickerProps } from '../../types';

export const SrDateRangePicker = ({
  fromName,
  toName,
  fromLabel,
  toLabel,
  disabled,
  minDate,
  maxDate,
}: SrDateRangePickerProps) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <SrDatePickerField
      name={fromName}
      label={fromLabel}
      disabled={disabled}
      minDate={minDate}
      maxDate={maxDate}
    />
    <SrDatePickerField
      name={toName}
      label={toLabel}
      disabled={disabled}
      minDate={minDate}
      maxDate={maxDate}
    />
  </div>
);
