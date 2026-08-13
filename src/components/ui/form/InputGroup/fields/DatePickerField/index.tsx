import { useFormContext } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  FormField,
  FormControl,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
} from '~root/components/ui';
import { cn } from '~root/lib/utils';
import { getIntlLocaleTag } from '~root/i18n/dateLocale';
import type { Language } from '~root/constants';
import { FieldShell } from '../../shared/FieldShell';
import { toDateOnlyString, parseDateOnlyString } from '../../shared/date';
import type { SrDatePickerFieldProps } from '../../types';

export const SrDatePickerField = ({
  name,
  label,
  description,
  placeholder,
  disabled,
  minDate,
  maxDate,
}: SrDatePickerFieldProps) => {
  const { control } = useFormContext();
  const { t, i18n } = useTranslation('forms');

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value: Date | undefined = field.value ? parseDateOnlyString(field.value) : undefined;

        return (
          <FieldShell label={label} description={description} wrapInControl={false}>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      'w-full justify-start font-normal',
                      !value && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value
                      ? value.toLocaleDateString(getIntlLocaleTag(i18n.language as Language))
                      : (placeholder ?? t('datePickerPlaceholder'))}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value}
                  onSelect={(date) => field.onChange(date ? toDateOnlyString(date) : '')}
                  disabled={(date) =>
                    (minDate ? date < minDate : false) || (maxDate ? date > maxDate : false)
                  }
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </FieldShell>
        );
      }}
    />
  );
};
