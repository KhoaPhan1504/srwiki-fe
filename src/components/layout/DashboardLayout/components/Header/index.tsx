import { Menu, Search } from 'lucide-react';
import { Button } from '~root/components/ui/button';
import { NotificationBell } from '~root/components/layout/DashboardLayout/components/NotificationBell';
import { ThemeToggle } from '~root/components/layout/DashboardLayout/components/ThemeToggle';
import { UserMenu } from '~root/components/layout/DashboardLayout/components/UserMenu';

type Props = { onMenuClick: () => void; onOpenPalette: () => void };

export const Header = ({ onMenuClick, onOpenPalette }: Props) => (
  <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-8">
    <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
      <Menu className="h-5 w-5" />
    </Button>
    <div className="flex flex-1 justify-center sm:justify-start">
      <button
        type="button"
        onClick={onOpenPalette}
        aria-label="Tìm kiếm"
        className="flex h-9 items-center gap-2 rounded-full border bg-muted/50 px-3 text-muted-foreground transition-colors hover:bg-muted sm:w-full sm:max-w-[400px]"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden truncate text-sm sm:inline">Tìm kiếm...</span>
        <kbd className="ml-auto hidden shrink-0 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </button>
    </div>
    <div className="flex items-center gap-3">
      <NotificationBell />
      <ThemeToggle />
      <UserMenu />
    </div>
  </header>
);
