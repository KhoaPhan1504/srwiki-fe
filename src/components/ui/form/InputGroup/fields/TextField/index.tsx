import { useFormContext } from 'react-hook-form';
import { FormField, Input } from '~root/components/ui';
import { FieldShell } from '~root/components/common';
import type { SrTextFieldProps } from '~root/components/ui/form/InputGroup/types';

export const SrTextField = ({
  name,
  label,
  description,
  placeholder,
  disabled,
}: SrTextFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description}>
          <Input
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
