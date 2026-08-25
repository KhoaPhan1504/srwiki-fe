import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { authAtom } from '~root/stores';
import type { AuthUser } from '~root/stores';
import { Role } from '~root/constants';
import { protectedRouteTree } from './routeTree';
import type { RouteType } from './routeTree';

interface PrivateRouteProps {
  element: ReactElement;
  allowedRoles?: Array<AuthUser['role']>;
}

export const PrivateRoute = ({ element, allowedRoles }: PrivateRouteProps) => {
  const auth = useAtomValue(authAtom);
  const location = useLocation();

  if (!auth?.token) {
    const callbackUrl = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

export const flattenRouteTree = (tree: RouteType[]): RouteObject[] =>
  tree.flatMap((node) => [
    ...(node.path && node.element
      ? [
          {
            path: node.path,
            element: (
              <PrivateRoute
                element={node.element}
                allowedRoles={node.adminOnly ? [Role.ADMIN, Role.SUPER_ADMIN] : undefined}
              />
            ),
          },
        ]
      : []),
    ...(node.children ? flattenRouteTree(node.children) : []),
  ]);

export const protectedRoutes: RouteObject[] = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  ...flattenRouteTree(protectedRouteTree),
];
