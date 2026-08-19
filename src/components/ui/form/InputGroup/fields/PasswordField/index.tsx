import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { FormField, FormControl, Input } from '~root/components/ui';
import { FieldShell } from '~root/components/common';
import type { SrPasswordFieldProps } from '~root/components/ui/form/InputGroup/types';

export const SrPasswordField = ({
  name,
  label,
  description,
  placeholder,
  disabled,
}: SrPasswordFieldProps) => {
  const { control } = useFormContext();
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description} wrapInControl={false}>
          <div className="relative">
            <FormControl>
              <Input
                type={visible ? 'text' : 'password'}
                placeholder={placeholder}
                disabled={disabled}
                className="pr-9"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setVisible((v) => !v)}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FieldShell>
      )}
    />
  );
};
