import { useFormContext } from 'react-hook-form';
import { FieldShell, PhoneInput } from '~root/components/common';
import { FormField } from '~root/components/ui';
import type { SrPhoneNumberFieldProps } from '~root/components/ui/form/InputGroup/types';

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
