import { Monitor, Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~root/components/ui/dropdown-menu';
import { Button } from '~root/components/ui/button';
import { useThemePreference } from '~root/providers/useThemePreference';
import { Theme } from '~root/constants';

const icons = { light: Sun, dark: Moon, system: Monitor };

export const ThemeToggle = () => {
  const { theme, setThemePreference } = useThemePreference();
  const Icon = icons[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setThemePreference(Theme.LIGHT)}>Sáng</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemePreference(Theme.DARK)}>Tối</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemePreference(Theme.SYSTEM)}>
          Theo hệ thống
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
