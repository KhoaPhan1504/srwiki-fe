import type { RouteType } from '~root/routes/routeTree';

export const filterTree = (tree: RouteType[], canSeeAdmin: boolean): RouteType[] =>
  tree.reduce<RouteType[]>((visible, node) => {
    if (node.adminOnly && !canSeeAdmin) return visible;
    if (node.children) {
      const children = filterTree(node.children, canSeeAdmin);
      if (children.length === 0) return visible;
      visible.push({ ...node, children });
      return visible;
    }
    visible.push(node);
    return visible;
  }, []);
