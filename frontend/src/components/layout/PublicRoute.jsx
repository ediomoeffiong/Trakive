/**
 * @file PublicRoute.jsx
 * @description Route guard that redirects authenticated users to the dashboard.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useIsAuthenticated } from '../../store/useAppStore';
import { ROUTES } from '../../constants';

const PublicRoute = () => {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
