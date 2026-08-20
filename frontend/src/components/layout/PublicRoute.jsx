/**
 * @file PublicRoute.jsx
 * @description Route guard that redirects authenticated users to their role-specific default dashboard.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useIsAuthenticated, useCurrentUser } from '../../store/useAppStore';
import { getRoleDefaultRoute } from '../../utils';

const PublicRoute = () => {
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();

  if (isAuthenticated) {
    return <Navigate to={getRoleDefaultRoute(user?.role)} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
