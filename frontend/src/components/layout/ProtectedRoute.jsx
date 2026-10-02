/**
 * @file ProtectedRoute.jsx
 * @description Route guard that redirects unauthenticated users to the login page.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useIsAuthenticated, useAuthResolved } from '../../store/useAppStore';
import { ROUTES } from '../../constants';
import { hasAuthTokens } from '../../utils/authSession';

const ProtectedRoute = () => {
  const isAuthenticated = useIsAuthenticated();
  const authResolved = useAuthResolved();

  if (!authResolved) return null;

  if (!isAuthenticated || !hasAuthTokens()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
