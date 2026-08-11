import { useFormContext } from 'react-hook-form';
import { FormField, Checkbox, Label } from '~root/components/ui';
import { SrDatePickerField } from '../DatePickerField';
import type { SrDateRangeWithTimespanFieldProps } from '../../types';

export const SrDateRangeWithTimespanField = ({
  fromName,
  toName,
  fromLabel,
  toLabel,
  isEmptyName,
  emptyLabel,
  disabled,
  minDate,
  maxDate,
}: SrDateRangeWithTimespanFieldProps) => {
  const { control, watch } = useFormContext();
  const isEmpty = watch(isEmptyName) === true;

  return (
    <div className="flex flex-col gap-3">
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
          disabled={disabled || isEmpty}
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>
      <FormField
        control={control}
        name={isEmptyName}
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id={isEmptyName}
              checked={field.value === true}
              disabled={disabled}
              onCheckedChange={field.onChange}
            />
            <Label htmlFor={isEmptyName} className="font-normal">
              {emptyLabel ?? 'Không giới hạn thời gian'}
            </Label>
          </div>
        )}
      />
    </div>
  );
};
