import { useFormContext } from 'react-hook-form';
import { FormField, Calendar, Button } from '~root/components/ui';
import { FieldShell } from '../../shared/FieldShell';
import { toDateOnlyString, parseDateOnlyString } from '../../shared/date';
import type { SrCalendarFieldProps } from '../../types';

type SlotValue = { date: string; slot: string } | null;

export const SrCalendarField = ({
  name,
  label,
  description,
  disabled,
  slots,
  minDate,
}: SrCalendarFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value: SlotValue = field.value ?? null;
        const selectedDate = value?.date ? parseDateOnlyString(value.date) : undefined;

        return (
          <FieldShell label={label} description={description}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Calendar
                mode="single"
                selected={selectedDate}
                disabled={(date) => !!disabled || (minDate ? date < minDate : false)}
                onSelect={(date) =>
                  field.onChange(date ? { date: toDateOnlyString(date), slot: '' } : null)
                }
              />
              <div className="flex flex-wrap gap-2 sm:flex-col">
                {slots.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    variant={value?.slot === slot ? 'default' : 'outline'}
                    size="sm"
                    disabled={disabled || !selectedDate}
                    onClick={() => field.onChange({ date: value?.date, slot })}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          </FieldShell>
        );
      }}
    />
  );
};
