import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField, Calendar, Button } from '~root/components/ui';
import { getDateFnsLocale } from '~root/i18n/dateLocale';
import type { Language } from '~root/constants';
import { FieldShell } from '~root/components/common';
import { toDateOnlyString, parseDateOnlyString } from '~root/utils';
import type { SrCalendarFieldProps } from '~root/components/ui/form/InputGroup/types';

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
  const { i18n } = useTranslation('forms');

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
                locale={getDateFnsLocale(i18n.language as Language)}
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
