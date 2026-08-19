import { useFormContext } from 'react-hook-form';
import { FormField, Checkbox, Label } from '~root/components/ui';
import { FieldShell } from '~root/components/common';
import type { SrCheckboxGroupFieldProps } from '~root/components/ui/form/InputGroup/types';

export const SrCheckboxGroupField = ({
  name,
  label,
  description,
  disabled,
  items,
}: SrCheckboxGroupFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = Array.isArray(field.value) ? field.value : [];
        const toggle = (value: string, checked: boolean) => {
          field.onChange(checked ? [...selected, value] : selected.filter((v) => v !== value));
        };

        return (
          <FieldShell label={label} description={description}>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div key={item.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`${name}-${item.value}`}
                    checked={selected.includes(item.value)}
                    disabled={disabled || item.disabled}
                    onCheckedChange={(checked) => toggle(item.value, checked === true)}
                  />
                  <Label htmlFor={`${name}-${item.value}`} className="font-normal">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </FieldShell>
        );
      }}
    />
  );
};
