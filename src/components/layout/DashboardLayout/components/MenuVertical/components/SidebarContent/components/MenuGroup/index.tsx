import { useTranslation } from 'react-i18next';
import { Separator } from '~root/components/ui';
import { getNodeKey } from '~root/routes/routeTree';
import type { RouteType } from '~root/routes/routeTree';
import { MenuItem } from '../MenuItem';

type Props = {
  group: RouteType;
  expandedPaths: Set<string>;
  onToggle: (key: string) => void;
  onNavigate?: () => void;
};

export const MenuGroup = ({ group, expandedPaths, onToggle, onNavigate }: Props) => {
  const { t } = useTranslation('header');

  if (!group.children) {
    return <MenuItem item={group} isExpanded={false} onToggle={onToggle} onNavigate={onNavigate} />;
  }

  return (
    <>
      <Separator className="my-2" />
      <p className="px-3 text-xs font-semibold tracking-wide text-muted-foreground/70 uppercase">
        {t(group.title)}
      </p>
      {group.children.map((item) => {
        const key = getNodeKey(item);
        return (
          <MenuItem
            key={key}
            item={item}
            isExpanded={expandedPaths.has(key)}
            onToggle={onToggle}
            onNavigate={onNavigate}
          />
        );
      })}
    </>
  );
};
