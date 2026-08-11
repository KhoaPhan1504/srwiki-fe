import { useFormContext } from 'react-hook-form';
import { FormField, RadioGroup, RadioGroupItem } from '~root/components/ui';
import { cn } from '~root/lib/utils';
import { FieldShell } from '../../shared/FieldShell';
import type { SrRadioActionFieldProps } from '../../types';

export const SrRadioActionField = ({
  name,
  label,
  description,
  disabled,
  items,
}: SrRadioActionFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description}>
          <RadioGroup
            value={field.value ?? ''}
            onValueChange={field.onChange}
            disabled={disabled}
            className="grid gap-2 sm:grid-cols-2"
          >
            {items.map((item) => (
              <label
                key={item.value}
                htmlFor={`${name}-action-${item.value}`}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition-colors',
                  field.value === item.value ? 'border-primary bg-primary/5' : 'border-input',
                  (disabled || item.disabled) && 'cursor-not-allowed opacity-50',
                )}
              >
                <RadioGroupItem
                  id={`${name}-action-${item.value}`}
                  value={item.value}
                  disabled={item.disabled}
                />
                {item.label}
              </label>
            ))}
          </RadioGroup>
        </FieldShell>
      )}
    />
  );
};
