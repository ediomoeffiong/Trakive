/**
 * @file RoleGuard.jsx
 * @description Role-aware route guard ensuring users only access routes permitted for their role.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useIsAuthenticated, useCurrentUser } from '../../store';
import { ROUTES, USER_ROLES } from '../../constants';

const ROLE_DEFAULT_ROUTES = {
  [USER_ROLES.INTERN]: ROUTES.DASHBOARD,
  [USER_ROLES.SUPERVISOR]: ROUTES.SUPERVISOR_DASHBOARD,
  [USER_ROLES.HR_ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [USER_ROLES.DEPARTMENT_HEAD]: ROUTES.DEPARTMENT_HEAD_DASHBOARD,
};

const RoleGuard = ({ allowedRoles = [] }) => {
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const userRole = user?.role || USER_ROLES.INTERN;

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to default home page for user's role if unauthorized for this route
    const redirectPath = ROLE_DEFAULT_ROUTES[userRole] || ROUTES.DASHBOARD;
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
