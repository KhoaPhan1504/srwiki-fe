import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '~root/lib/utils';
import type { RouteType } from '~root/routes/routeTree';

type Props = {
  item: RouteType;
  onNavigate?: () => void;
};

export const MenuSubItem = ({ item, onNavigate }: Props) => {
  const { t } = useTranslation('header');

  if (!item.path) return null;

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
          isActive
            ? 'bg-dashboard-accent text-dashboard-accent-foreground'
            : 'text-muted-foreground hover:bg-muted',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
          )}
          {item.prefix}
          {t(item.title)}
          {item.suffix}
        </>
      )}
    </NavLink>
  );
};
