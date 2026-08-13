import { useState, type UIEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  FormField,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  Button,
} from '~root/components/ui';
import { cn } from '~root/lib/utils';
import { FieldShell } from '../../shared/FieldShell';
import type { SrScrollableAutoCompleteProps } from '../../types';

export const SrScrollableAutoComplete = ({
  name,
  label,
  description,
  placeholder,
  disabled,
  items,
  isLoading,
  hasMore,
  fetchNextPage,
}: SrScrollableAutoCompleteProps) => {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('forms');

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    if (hasMore && !isLoading && el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      fetchNextPage();
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedItem = items.find((item) => item.value === field.value);

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
                    {selectedItem?.label ?? (
                      <span className="text-muted-foreground">{placeholder}</span>
                    )}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command shouldFilter={false}>
                  <CommandList onScroll={handleScroll} className="max-h-64">
                    <CommandEmpty>{t('noResults')}</CommandEmpty>
                    <CommandGroup>
                      {items.map((item) => (
                        <CommandItem
                          key={item.value}
                          value={item.value}
                          disabled={item.disabled}
                          onSelect={() => {
                            field.onChange(item.value);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              field.value === item.value ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {item.label}
                        </CommandItem>
                      ))}
                      {isLoading && (
                        <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('loading')}
                        </div>
                      )}
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
