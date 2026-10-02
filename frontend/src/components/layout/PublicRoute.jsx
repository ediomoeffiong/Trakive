/**
 * @file PublicRoute.jsx
 * @description Route guard that redirects authenticated users to their role-specific default dashboard.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useCurrentUser, useAuthResolved } from '../../store/useAppStore';
import { getRoleDefaultRoute } from '../../utils';
import { hasAuthTokens } from '../../utils/authSession';

const PublicRoute = () => {
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const authResolved = useAuthResolved();
  const location = useLocation();

  if (!authResolved) return null;

  if (isAuthenticated && hasAuthTokens() && location.pathname !== ROUTES.RESET_PASSWORD) {
    return <Navigate to={getRoleDefaultRoute(user?.role)} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
