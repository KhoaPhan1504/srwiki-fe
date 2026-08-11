import { useFormContext } from 'react-hook-form';
import { FormField, Input } from '~root/components/ui';
import { FieldShell } from '../../shared/FieldShell';
import type { SrTimePickerFieldProps } from '../../types';

export const SrTimePickerField = ({
  name,
  label,
  description,
  disabled,
}: SrTimePickerFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description}>
          <Input type="time" disabled={disabled} {...field} value={field.value ?? ''} />
        </FieldShell>
      )}
    />
  );
};
