import { useFormContext } from 'react-hook-form';
import { FormField, RadioGroup, RadioGroupItem, Label } from '~root/components/ui';
import { FieldShell } from '~root/components/common';
import type { SrRadioGroupFieldProps } from '~root/components/ui/form/InputGroup/types';

export const SrRadioGroupField = ({
  name,
  label,
  description,
  disabled,
  items,
}: SrRadioGroupFieldProps) => {
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
            className="flex flex-col gap-2"
          >
            {items.map((item) => (
              <div key={item.value} className="flex items-center gap-2">
                <RadioGroupItem
                  id={`${name}-${item.value}`}
                  value={item.value}
                  disabled={item.disabled}
                />
                <Label htmlFor={`${name}-${item.value}`} className="font-normal">
                  {item.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </FieldShell>
      )}
    />
  );
};
