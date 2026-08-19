import { SrDatePickerField } from '~root/components/ui/form/InputGroup/fields/DatePickerField';
import type { SrDateRangePickerProps } from '~root/components/ui/form/InputGroup/types';

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
