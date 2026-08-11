import { useFormContext } from 'react-hook-form';
import { FormField, Textarea } from '~root/components/ui';
import { FieldShell } from '../../shared/FieldShell';
import type { SrTextAreaFieldProps } from '../../types';

export const SrTextAreaField = ({
  name,
  label,
  description,
  placeholder,
  disabled,
  rows,
}: SrTextAreaFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description}>
          <Textarea
            rows={rows}
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
