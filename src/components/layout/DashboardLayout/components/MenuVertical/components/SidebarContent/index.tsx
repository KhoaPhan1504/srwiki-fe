import { Fragment } from 'react';
import { useAtomValue } from 'jotai';
import { MenuOptions } from './configs';
import type { MenuOption } from './configs';
import { NavLink } from 'react-router-dom';
import { cn } from '~root/lib/utils';
import { useTranslation } from 'react-i18next';
import { authAtom } from '~root/stores';
import { Role } from '~root/constants';
import { Separator } from '~root/components/ui';

// Dashboard/Profile/Settings stay pinned above the scrollable nav list — everything else
// (admin-only links, the growing Tools section) scrolls independently so the sidebar never
// pushes the viewport taller as more tools are added.
const PINNED_PATHS = new Set(['/dashboard', '/profile', '/settings']);

export const SidebarContent = ({
  onNavigate,
  logoSrc,
}: {
  onNavigate?: () => void;
  logoSrc: string;
}) => {
  const { t } = useTranslation('header');
  const auth = useAtomValue(authAtom);
  const visibleOptions = MenuOptions.filter(
    (item) =>
      !item.adminOnly || auth?.user.role === Role.ADMIN || auth?.user.role === Role.SUPER_ADMIN,
  );
  const pinnedOptions = visibleOptions.filter((item) => PINNED_PATHS.has(item.to));
  const scrollableOptions = visibleOptions.filter((item) => !PINNED_PATHS.has(item.to));

  const renderOption = (
    { to, labelKey, icon: Icon, section }: MenuOption,
    index: number,
    list: MenuOption[],
  ) => {
    const showSectionHeader = section && section !== list[index - 1]?.section;
    return (
      <Fragment key={to}>
        {showSectionHeader && (
          <>
            <Separator className="my-2" />
            <p className="px-3 text-xs font-semibold tracking-wide text-muted-foreground/70 uppercase">
              {t(section)}
            </p>
          </>
        )}
        <NavLink
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
      </Fragment>
    );
  };

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2 text-lg">
        <img src={logoSrc} alt="SR-WIKI Logo" className="inline-block" />
      </div>
      <div className="flex flex-col gap-3">
        {pinnedOptions.map((item, index) => renderOption(item, index, pinnedOptions))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {scrollableOptions.map((item, index) => renderOption(item, index, scrollableOptions))}
      </div>
    </div>
  );
};
