import { Menu } from 'lucide-react';
import { Button } from '~root/components/ui/button';
import { ThemeToggle } from '~root/components/layout/ThemeToggle';
import { UserMenu } from '~root/components/layout/UserMenu';

type Props = { onMenuClick: () => void };

export const AppHeader = ({ onMenuClick }: Props) => (
  <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
    <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
      <Menu className="h-5 w-5" />
    </Button>
    <div className="flex-1" />
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <UserMenu />
    </div>
  </header>
);
