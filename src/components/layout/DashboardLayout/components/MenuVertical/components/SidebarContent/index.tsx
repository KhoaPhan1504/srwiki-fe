import { useAtomValue } from 'jotai';
import { useLogout } from '~root/apis';
import { MenuOptions } from './configs';
import { NavLink } from 'react-router-dom';
import { cn } from '~root/lib/utils';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authAtom } from '~root/stores';

export const SidebarContent = ({
  onNavigate,
  logoSrc,
}: {
  onNavigate?: () => void;
  logoSrc: string;
}) => {
  const { t } = useTranslation('header');
  const auth = useAtomValue(authAtom);
  const logout = useLogout();
  const visibleOptions = MenuOptions.filter(
    (item) => !item.adminOnly || auth?.user.role === 'admin',
  );

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2 text-lg">
        <img src={logoSrc} alt="SR-WIKI Logo" className="inline-block" />
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {visibleOptions.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-dashboard-accent text-dashboard-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="mt-auto flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );
};
