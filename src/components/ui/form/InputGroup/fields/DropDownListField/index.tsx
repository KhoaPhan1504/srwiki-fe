import { useFormContext } from 'react-hook-form';
import { Check, ChevronsUpDown, X } from 'lucide-react';
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
  Badge,
} from '~root/components/ui';
import { cn } from '~root/lib/utils';
import { FieldShell } from '../../shared/FieldShell';
import type { SrDropDownListFieldProps } from '../../types';

export const SrDropDownListField = ({
  name,
  label,
  description,
  placeholder,
  disabled,
  items,
}: SrDropDownListFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = Array.isArray(field.value) ? field.value : [];
        const toggle = (value: string) => {
          field.onChange(
            selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value],
          );
        };

        return (
          <FieldShell label={label} description={description}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  className="w-full justify-between font-normal"
                >
                  <span className="flex flex-1 flex-wrap gap-1 text-left">
                    {selected.length === 0 && (
                      <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    {items
                      .filter((item) => selected.includes(item.value))
                      .map((item) => (
                        <Badge key={item.value} variant="secondary" className="gap-1">
                          {item.label}
                          <X
                            className="h-3 w-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle(item.value);
                            }}
                          />
                        </Badge>
                      ))}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command>
                  <CommandInput placeholder="Tìm kiếm..." />
                  <CommandList>
                    <CommandEmpty>Không có kết quả.</CommandEmpty>
                    <CommandGroup>
                      {items.map((item) => (
                        <CommandItem
                          key={item.value}
                          value={item.label}
                          disabled={item.disabled}
                          onSelect={() => toggle(item.value)}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selected.includes(item.value) ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {item.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
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
