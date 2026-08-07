import { Monitor, Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~root/components/ui/dropdown-menu';
import { Button } from '~root/components/ui/button';
import { useTheme } from '~root/providers/ThemeProvider';

const icons = { light: Sun, dark: Moon, system: Monitor };

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const Icon = icons[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Sáng</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Tối</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>Theo hệ thống</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
