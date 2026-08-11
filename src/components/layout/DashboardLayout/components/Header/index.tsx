import { Menu } from 'lucide-react';
import { Button } from '~root/components/ui/button';
import { ThemeToggle } from '~root/components/layout/DashboardLayout/components/ThemeToggle';
import { UserMenu } from '~root/components/layout/DashboardLayout/components/UserMenu';

type Props = { onMenuClick: () => void };

export const Header = ({ onMenuClick }: Props) => (
  <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-8">
    <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
      <Menu className="h-5 w-5" />
    </Button>
    <div className="flex-1" />
    <div className="flex items-center gap-3">
      <ThemeToggle />
      <UserMenu />
    </div>
  </header>
);
