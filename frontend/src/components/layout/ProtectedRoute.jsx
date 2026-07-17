/**
 * @file ProtectedRoute.jsx
 * @description Route guard that redirects unauthenticated users to the login page.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useIsAuthenticated } from '../../store/useAppStore';
import { ROUTES } from '../../constants';

const ProtectedRoute = () => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
