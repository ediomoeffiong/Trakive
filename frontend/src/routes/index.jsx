/**
 * @file index.jsx
 * @description Centralised route configuration for Trakive.
 * Structure:
 *  / (public)       → Landing page
 *  /login           → Auth (AuthLayout)
 *  /register        → Auth (AuthLayout)
 *  /dashboard/*     → App (AppLayout, authenticated)
 *  *                → 404 NotFound
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts';
import { AuthLayout } from '../layouts';
import { ROUTES } from '../constants';
import { PublicRoute, ProtectedRoute } from '../components/layout';

// Pages
import Landing         from '../pages/Landing';
import Dashboard       from '../pages/Dashboard';
import Login           from '../pages/Login';
import Register        from '../pages/Register';
import ForgotPassword  from '../pages/ForgotPassword';
import ResetPassword   from '../pages/ResetPassword';
import VerifyEmail     from '../pages/VerifyEmail';
import NotFound        from '../pages/NotFound';
import PlaceholderPage from '../pages/PlaceholderPage';
import ErrorPage       from '../pages/ErrorPage';
import TaskList        from '../pages/TaskList';
import TaskDetails     from '../pages/TaskDetails';
import OnboardingDashboard from '../pages/OnboardingDashboard';
import OnboardingStepDetails from '../pages/OnboardingStepDetails';
import ReviewsList from '../pages/ReviewsList';
import ReviewDetails from '../pages/ReviewDetails';


const router = createBrowserRouter([
  // ── Public Route — Landing ─────────────────────────────────────────────────
  { path: ROUTES.LANDING,  element: <Landing /> },
  { path: ROUTES.FAQ,      element: <PlaceholderPage title="FAQ" /> },
  { path: ROUTES.PRIVACY,  element: <PlaceholderPage title="Privacy Policy" /> },
  { path: ROUTES.TERMS,    element: <PlaceholderPage title="Terms of Service" /> },
  { path: ROUTES.CONTACT,  element: <PlaceholderPage title="Contact" /> },

  // ── Auth Routes (unauthenticated only) ─────────────────────────────────────
  {
    element: <PublicRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN,           element: <Login /> },
          { path: ROUTES.REGISTER,        element: <Register /> },
          { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPassword /> },
          { path: ROUTES.RESET_PASSWORD,  element: <ResetPassword /> },
          { path: ROUTES.VERIFY_EMAIL,    element: <VerifyEmail /> },
        ],
      },
    ],
  },

  // ── App Routes (authenticated shell) ──────────────────────────────────────
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.DASHBOARD,  element: <Dashboard /> },
          { path: ROUTES.ANALYTICS,  element: <PlaceholderPage title="Analytics" /> },
          { path: ROUTES.PROJECTS,   element: <PlaceholderPage title="Projects" /> },
          { path: ROUTES.TASKS,      element: <TaskList /> },
          { path: ROUTES.TASK_DETAILS, element: <TaskDetails /> },
          { path: ROUTES.ONBOARDING, element: <OnboardingDashboard /> },
          { path: ROUTES.ONBOARDING_DETAILS, element: <OnboardingStepDetails /> },
          { path: ROUTES.REVIEWS,        element: <ReviewsList /> },
          { path: ROUTES.REVIEW_DETAILS,   element: <ReviewDetails /> },
          { path: ROUTES.NOTIFICATIONS, element: <PlaceholderPage title="Notifications" /> },
          { path: ROUTES.TEAM,       element: <PlaceholderPage title="Team" /> },
          { path: ROUTES.REPORTS,    element: <PlaceholderPage title="Reports" /> },
          { path: ROUTES.SETTINGS,   element: <PlaceholderPage title="Settings" /> },
          { path: ROUTES.PROFILE,    element: <PlaceholderPage title="Profile" /> },
        ],
      },
    ],
  },

  // ── Catch-all ──────────────────────────────────────────────────────────────
  { path: ROUTES.NOT_FOUND, element: <NotFound /> },
]);

export default router;
