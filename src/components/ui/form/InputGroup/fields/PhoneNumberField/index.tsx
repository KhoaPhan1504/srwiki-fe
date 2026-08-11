import { useFormContext } from 'react-hook-form';
import { FormField } from '~root/components/ui';
import { PhoneInput } from '~root/components/common';
import { FieldShell } from '../../shared/FieldShell';
import type { SrPhoneNumberFieldProps } from '../../types';

export const SrPhoneNumberField = ({ name, label, description }: SrPhoneNumberFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description}>
          <PhoneInput value={field.value ?? ''} onChange={field.onChange} />
        </FieldShell>
      )}
    />
  );
};
