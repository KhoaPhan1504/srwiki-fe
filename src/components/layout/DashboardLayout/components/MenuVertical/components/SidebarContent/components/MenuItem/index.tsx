import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { cn } from '~root/lib/utils';
import { getNodeKey } from '~root/routes/routeTree';
import type { RouteType } from '~root/routes/routeTree';
import { MenuSubItem } from '../MenuSubItem';

type Props = {
  item: RouteType;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onNavigate?: () => void;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-dashboard-accent text-dashboard-accent-foreground'
      : 'text-muted-foreground hover:bg-muted',
  );

export const MenuItem = ({ item, isExpanded, onToggle, onNavigate }: Props) => {
  const { t } = useTranslation('header');
  const key = getNodeKey(item);
  const hasChildren = !!item.children && item.children.length > 0;
  const label = (
    <>
      {item.prefix}
      {t(item.title)}
      {item.suffix}
    </>
  );

  return (
    <div>
      <div className="flex items-center gap-1">
        {item.path ? (
          <NavLink to={item.path} onClick={onNavigate} className={linkClass}>
            {label}
          </NavLink>
        ) : (
          <span className="flex flex-1 items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
            {label}
          </span>
        )}
        {hasChildren && (
          <button
            type="button"
            aria-label={t(item.title)}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={() => onToggle(key)}
          >
            <ChevronRight
              className={cn('h-4 w-4 shrink-0 transition-transform', { 'rotate-90': isExpanded })}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="mt-1 flex flex-col gap-1 pl-4">
          {item.children!.map((sub) => (
            <MenuSubItem key={getNodeKey(sub)} item={sub} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};
