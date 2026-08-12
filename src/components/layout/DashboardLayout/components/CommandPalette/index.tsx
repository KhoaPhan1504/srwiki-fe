import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem as CommandListItem,
  CommandList,
} from '~root/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~root/components/ui/dialog';
import { useThemePreference } from '~root/providers/useThemePreference';
import { NAV_ITEMS } from './config/navItems';
import type { NavItem } from './config/navItems';
import { getThemeCommands } from './config/commands';
import type { PaletteCommand } from './config/commands';
import { fuzzyScore } from './fuzzyMatch';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const filterItems = (value: string, search: string) => {
  const query = search.startsWith('/') ? search.slice(1) : search;
  return fuzzyScore(query, value) ?? 0;
};

export const CommandPalette = ({ open, onOpenChange }: Props) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { setThemePreference } = useThemePreference();
  const isCommandMode = search.startsWith('/');
  const commands = getThemeCommands(setThemePreference);

  const close = () => {
    onOpenChange(false);
    setSearch('');
  };

  const runNavItem = (item: NavItem) => {
    navigate(item.to);
    close();
  };

  const runCommand = (item: PaletteCommand) => {
    item.run();
    close();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent className="overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>Tìm trang hoặc gõ / để chạy lệnh</DialogDescription>
        </DialogHeader>
        <Command
          filter={filterItems}
          className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={isCommandMode ? 'Gõ lệnh...' : 'Tìm kiếm trang... (gõ / để chạy lệnh)'}
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
            {isCommandMode ? (
              <CommandGroup heading="Lệnh">
                {commands.map((item) => (
                  <CommandListItem
                    key={item.id}
                    value={item.label}
                    onSelect={() => runCommand(item)}
                  >
                    <item.icon />
                    {item.label}
                  </CommandListItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandGroup heading="Điều hướng">
                {NAV_ITEMS.map((item) => (
                  <CommandListItem
                    key={item.id}
                    value={[item.label, ...(item.keywords ?? [])].join(' ')}
                    onSelect={() => runNavItem(item)}
                  >
                    <item.icon />
                    {item.label}
                  </CommandListItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
