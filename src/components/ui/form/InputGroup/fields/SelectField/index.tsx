import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormControl,
  Select,
  SelectContent,
  SelectItem as SelectItemUi,
  SelectTrigger,
  SelectValue,
} from '~root/components/ui';
import { FieldShell } from '../../shared/FieldShell';
import type { SrSelectFieldProps } from '../../types';

// WARNING: Do NOT feed this a controlled value that changes after mount (e.g., via form.reset(...) in useEffect).
// This causes Radix Select's displayed value to become visually blank despite correct react-hook-form state.
// Workaround: mount the form only once its seed data has loaded, seeding defaultValues from the first render.
// See GeneralTab for a working example.
export const SrSelectField = ({
  name,
  label,
  description,
  placeholder,
  disabled,
  items,
}: SrSelectFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const hasMatch = items.some((item) => item.value === field.value);

        return (
          <FieldShell label={label} description={description} wrapInControl={false}>
            <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={disabled}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={placeholder}>
                    {field.value && !hasMatch ? field.value : undefined}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {items.map((item) => (
                  <SelectItemUi key={item.value} value={item.value} disabled={item.disabled}>
                    {item.label}
                  </SelectItemUi>
                ))}
              </SelectContent>
            </Select>
          </FieldShell>
        );
      }}
    />
  );
};
