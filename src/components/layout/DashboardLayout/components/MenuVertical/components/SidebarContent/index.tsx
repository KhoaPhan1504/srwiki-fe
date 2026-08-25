import { useAtomValue } from 'jotai';
import { protectedRouteTree } from '~root/routes/routeTree';
import { authAtom } from '~root/stores';
import { Role } from '~root/constants';
import { MenuTree } from './components';
import { filterTree } from './filterTree';

export const SidebarContent = ({
  onNavigate,
  logoSrc,
}: {
  onNavigate?: () => void;
  logoSrc: string;
}) => {
  const auth = useAtomValue(authAtom);
  const canSeeAdmin = auth?.user.role === Role.ADMIN || auth?.user.role === Role.SUPER_ADMIN;
  const visibleItems = filterTree(protectedRouteTree, canSeeAdmin);

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2 text-lg">
        <img src={logoSrc} alt="SR-WIKI Logo" className="inline-block" />
      </div>
      <MenuTree items={visibleItems} onNavigate={onNavigate} />
    </div>
  );
};
