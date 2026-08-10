import { useLayoutEffect } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import { protectedRoutes } from './protected';
import { publicRoutes } from './public';

export const AppRoutes = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const element = useRoutes([...publicRoutes, ...protectedRoutes]);

  return <>{element}</>;
};
