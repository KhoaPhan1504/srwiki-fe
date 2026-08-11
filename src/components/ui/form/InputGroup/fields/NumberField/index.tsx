import { useFormContext } from 'react-hook-form';
import { FormField, Input } from '~root/components/ui';
import { FieldShell } from '../../shared/FieldShell';
import type { SrNumberFieldProps } from '../../types';

export const SrNumberField = ({
  name,
  label,
  description,
  placeholder,
  disabled,
}: SrNumberFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description}>
          <Input
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            {...field}
            value={field.value ?? ''}
          />
        </FieldShell>
      )}
    />
  );
};
