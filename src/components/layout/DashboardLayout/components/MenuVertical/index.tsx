import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { Sheet, SheetContent } from '~root/components/ui/sheet';
import { useLogout } from '~root/apis/useLogout';
import { cn } from '~root/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Hồ sơ', icon: User },
  { to: '/settings', label: 'Cài đặt', icon: SettingsIcon },
];

type Props = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const logout = useLogout();

  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className="mb-4 px-2 text-lg font-semibold">SR-WIKI</div>
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
      <button
        onClick={logout}
        className="mt-auto flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" />
        Đăng xuất
      </button>
    </div>
  );
};

export const MenuVertical = ({ mobileOpen, onMobileOpenChange }: Props) => (
  <>
    <aside className="hidden w-64 flex-shrink-0 border-r bg-card md:block">
      <SidebarContent />
    </aside>
    <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SidebarContent onNavigate={() => onMobileOpenChange(false)} />
      </SheetContent>
    </Sheet>
  </>
);
