import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getNodeKey } from '~root/routes/routeTree';
import type { RouteType } from '~root/routes/routeTree';
import { MenuGroup } from '../MenuGroup';

type Props = {
  items: RouteType[];
  onNavigate?: () => void;
};

const findExpandedAncestors = (items: RouteType[], pathname: string): string[] | null => {
  for (const item of items) {
    if (item.children) {
      const nested = findExpandedAncestors(item.children, pathname);
      if (nested !== null) return [getNodeKey(item), ...nested];
    } else if (item.path === pathname) {
      return [];
    }
  }
  return null;
};

export const MenuTree = ({ items, onNavigate }: Props) => {
  const location = useLocation();
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => new Set(findExpandedAncestors(items, location.pathname) ?? []),
  );
  const [trackedPathname, setTrackedPathname] = useState(location.pathname);

  // Adjust state during render (React's documented alternative to an effect here) so
  // navigating to a route inside a collapsed branch auto-expands it without an extra
  // render-then-setState round trip.
  if (location.pathname !== trackedPathname) {
    setTrackedPathname(location.pathname);
    const ancestors = findExpandedAncestors(items, location.pathname);
    if (ancestors && ancestors.length > 0) {
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        ancestors.forEach((key) => next.add(key));
        return next;
      });
    }
  }

  const toggleExpanded = (key: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      {items.map((item) => (
        <MenuGroup
          key={getNodeKey(item)}
          group={item}
          expandedPaths={expandedPaths}
          onToggle={toggleExpanded}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
};
