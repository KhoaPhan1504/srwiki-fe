import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import {
  FormField,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Button,
} from '~root/components/ui';
import { cn } from '~root/lib/utils';
import { FieldShell } from '../../shared/FieldShell';
import type { SrDynamicAutoCompleteFieldProps } from '../../types';

export const SrDynamicAutoCompleteField = ({
  name,
  label,
  description,
  placeholder,
  disabled,
  items,
  isLoading,
  multiple,
  handleSearch,
}: SrDynamicAutoCompleteFieldProps) => {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedValues: string[] = multiple
          ? Array.isArray(field.value)
            ? field.value
            : []
          : field.value
            ? [field.value]
            : [];
        const selectedLabel = items.find((item) => item.value === selectedValues[0])?.label;

        const handleSelect = (value: string) => {
          if (multiple) {
            const next = selectedValues.includes(value)
              ? selectedValues.filter((v) => v !== value)
              : [...selectedValues, value];
            field.onChange(next);
          } else {
            field.onChange(value);
            setOpen(false);
          }
        };

        return (
          <FieldShell label={label} description={description}>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  className="w-full justify-between font-normal"
                >
                  <span className="truncate text-left">
                    {selectedValues.length === 0 ? (
                      <span className="text-muted-foreground">{placeholder}</span>
                    ) : multiple ? (
                      `${selectedValues.length} đã chọn`
                    ) : (
                      selectedLabel
                    )}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Tìm kiếm..." onValueChange={handleSearch} />
                  <CommandList>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tìm...
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>Không có kết quả.</CommandEmpty>
                        <CommandGroup>
                          {items.map((item) => (
                            <CommandItem
                              key={item.value}
                              value={item.value}
                              disabled={item.disabled}
                              onSelect={() => handleSelect(item.value)}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedValues.includes(item.value) ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                              {item.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FieldShell>
        );
      }}
    />
  );
};
