import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { FieldShell } from '~root/components/common';
import type {
  SrAutoCompleteFieldProps,
  SrSelectItem,
} from '~root/components/ui/form/InputGroup/types';

export const SrAutoCompleteField = ({
  name,
  label,
  description,
  placeholder,
  disabled,
  items,
  multiple,
}: SrAutoCompleteFieldProps) => {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('forms');

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
        const selectedItems = items.filter((item) => selectedValues.includes(item.value));

        const handleSelect = (item: SrSelectItem) => {
          if (multiple) {
            const next = selectedValues.includes(item.value)
              ? selectedValues.filter((v) => v !== item.value)
              : [...selectedValues, item.value];
            field.onChange(next);
          } else {
            field.onChange(item.value);
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
                  <span className="flex flex-1 flex-wrap gap-1 truncate text-left">
                    {selectedItems.length === 0 && (
                      <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    {multiple
                      ? selectedItems.map((item) => (
                          <Badge key={item.value} variant="secondary" className="gap-1">
                            {item.label}
                            <X
                              className="h-3 w-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(item);
                              }}
                            />
                          </Badge>
                        ))
                      : selectedItems[0]?.label}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command>
                  <CommandInput placeholder={t('search')} />
                  <CommandList>
                    <CommandEmpty>{t('noResults')}</CommandEmpty>
                    <CommandGroup>
                      {items.map((item) => (
                        <CommandItem
                          key={item.value}
                          value={item.label}
                          disabled={item.disabled}
                          onSelect={() => handleSelect(item)}
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
