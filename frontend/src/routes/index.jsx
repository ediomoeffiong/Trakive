/**
 * @file index.jsx
 * @description Centralised role-aware route configuration for Trakive.
 * Supports:
 *  - Public / Auth routes
 *  - Intern Portal routes (/dashboard/*) guarded by RoleGuard for Intern
 *  - Supervisor Portal routes (/supervisor/*) guarded by RoleGuard for Supervisor
 *  - HR Admin / Dept Head routes (/admin/*) guarded by RoleGuard for Admin
 */

import { createBrowserRouter } from 'react-router-dom';
import { InternLayout, SupervisorLayout, AdminLayout, AuthLayout } from '../layouts';
import { ROUTES, USER_ROLES } from '../constants';
import { PublicRoute, RoleGuard } from '../components/layout';

// Public & Auth Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyEmail from '../pages/VerifyEmail';
import NotFound from '../pages/NotFound';
import PlaceholderPage from '../pages/PlaceholderPage';
import ErrorPage from '../pages/ErrorPage';

// Intern Pages
import Dashboard from '../pages/Dashboard';
import TaskList from '../pages/TaskList';
import TaskDetails from '../pages/TaskDetails';
import OnboardingDashboard from '../pages/OnboardingDashboard';
import OnboardingStepDetails from '../pages/OnboardingStepDetails';
import ReviewsList from '../pages/ReviewsList';
import ReviewDetails from '../pages/ReviewDetails';
import NotificationsPage from '../pages/NotificationsPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';

// Supervisor Pages
import SupervisorDashboardPage from '../pages/supervisor/Dashboard';
import SupervisorPlaceholderPage from '../pages/supervisor/PlaceholderPage';
import InternManagementPage from '../pages/supervisor/InternManagement';
import InternProfilePage from '../pages/supervisor/InternProfile';
import TaskManagementPage from '../pages/supervisor/TaskManagement';
import ReviewManagementPage from '../pages/supervisor/ReviewManagement';
import SupervisorNotificationsPage from '../pages/supervisor/SupervisorNotifications';
import SupervisorProfilePage from '../pages/supervisor/SupervisorProfile';

// Analytics & Reports Pages
import AnalyticsDashboardPage from '../pages/analytics/AnalyticsDashboardPage';
import ReportBuilderPage from '../pages/analytics/ReportBuilderPage';
import SavedReportsPage from '../pages/analytics/SavedReportsPage';
import ExportCenterPage from '../pages/analytics/ExportCenterPage';
import ComparisonDashboardPage from '../pages/analytics/ComparisonDashboardPage';
import DrillDownDetailPage from '../pages/analytics/DrillDownDetailPage';

// HR Admin Pages
import HRDashboard from '../pages/admin/Dashboard';
import HRInternManagement from '../pages/admin/InternManagement';
import HRSupervisorManagement from '../pages/admin/SupervisorManagement';
import HRDepartmentManagement from '../pages/admin/DepartmentManagement';
import HRAnnouncementsManagement from '../pages/admin/AnnouncementsManagement';
import HRBatchManagement from '../pages/admin/BatchManagement';
import HRUserManagement from '../pages/admin/UserManagement';
import HRReportsShortcut from '../pages/admin/ReportsShortcut';
import HRProfilePage from '../pages/admin/ProfilePage';
import HRSettingsPage from '../pages/SettingsPage';

// Department Head Pages
import {
  DepartmentHeadDashboard,
  DepartmentHeadSupervisors,
  DepartmentHeadInterns,
  DepartmentHeadTasks,
  DepartmentHeadReviews,
  DepartmentHeadAnalytics,
  DepartmentHeadApprovals,
  DepartmentHeadAnnouncements,
  DepartmentHeadNotifications,
  DepartmentHeadProfile,
  DepartmentHeadSettings,
} from '../pages/departmentHead';

const router = createBrowserRouter([
  // ── Public Routes — Landing & Info ──────────────────────────────────────────
  { path: ROUTES.LANDING, element: <Landing /> },
  { path: ROUTES.FAQ, element: <PlaceholderPage title="FAQ" /> },
  { path: ROUTES.PRIVACY, element: <PlaceholderPage title="Privacy Policy" /> },
  { path: ROUTES.TERMS, element: <PlaceholderPage title="Terms of Service" /> },
  { path: ROUTES.CONTACT, element: <PlaceholderPage title="Contact" /> },

  // ── Auth Routes (unauthenticated users only) ──────────────────────────────
  {
    element: <PublicRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: <Login /> },
          { path: ROUTES.REGISTER, element: <Register /> },
          { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPassword /> },
          { path: ROUTES.RESET_PASSWORD, element: <ResetPassword /> },
          { path: ROUTES.VERIFY_EMAIL, element: <VerifyEmail /> },
        ],
      },
    ],
  },

  // ── Intern Portal Routes (authenticated Interns) ─────────────────────────
  {
    element: <RoleGuard allowedRoles={[USER_ROLES.INTERN]} />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <InternLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <Dashboard /> },
          { path: ROUTES.ANALYTICS, element: <AnalyticsDashboardPage /> },
          { path: ROUTES.ANALYTICS_COMPARE, element: <ComparisonDashboardPage /> },
          { path: ROUTES.ANALYTICS_DRILLDOWN, element: <DrillDownDetailPage /> },
          { path: ROUTES.PROJECTS, element: <PlaceholderPage title="Projects" /> },
          { path: ROUTES.TASKS, element: <TaskList /> },
          { path: ROUTES.TASK_DETAILS, element: <TaskDetails /> },
          { path: ROUTES.ONBOARDING, element: <OnboardingDashboard /> },
          { path: ROUTES.ONBOARDING_DETAILS, element: <OnboardingStepDetails /> },
          { path: ROUTES.REVIEWS, element: <ReviewsList /> },
          { path: ROUTES.REVIEW_DETAILS, element: <ReviewDetails /> },
          { path: ROUTES.NOTIFICATIONS, element: <NotificationsPage /> },
          { path: ROUTES.TEAM, element: <PlaceholderPage title="Team" /> },
          { path: ROUTES.REPORTS, element: <AnalyticsDashboardPage /> },
          { path: ROUTES.REPORTS_BUILDER, element: <ReportBuilderPage /> },
          { path: ROUTES.REPORTS_SAVED, element: <SavedReportsPage /> },
          { path: ROUTES.REPORTS_EXPORT, element: <ExportCenterPage /> },
          { path: ROUTES.SETTINGS, element: <SettingsPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
        ],
      },
    ],
  },

  // ── Supervisor Portal Routes (authenticated Supervisors) ──────────────────
  {
    element: <RoleGuard allowedRoles={[USER_ROLES.SUPERVISOR]} />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <SupervisorLayout />,
        children: [
          { path: ROUTES.SUPERVISOR_DASHBOARD, element: <SupervisorDashboardPage /> },
          { path: ROUTES.SUPERVISOR_INTERNS, element: <InternManagementPage /> },
          { path: ROUTES.SUPERVISOR_INTERN_DETAILS, element: <InternProfilePage /> },
          { path: ROUTES.SUPERVISOR_TASKS, element: <TaskManagementPage /> },
          { path: ROUTES.SUPERVISOR_REVIEWS,   element: <ReviewManagementPage /> },
          { path: ROUTES.SUPERVISOR_ONBOARDING, element: <ReviewManagementPage /> },
          { path: ROUTES.SUPERVISOR_REPORTS, element: <AnalyticsDashboardPage /> },
          { path: ROUTES.SUPERVISOR_REPORTS_BUILDER, element: <ReportBuilderPage /> },
          { path: ROUTES.SUPERVISOR_REPORTS_SAVED, element: <SavedReportsPage /> },
          { path: ROUTES.SUPERVISOR_REPORTS_EXPORT, element: <ExportCenterPage /> },
          { path: ROUTES.SUPERVISOR_ANALYTICS_COMPARE, element: <ComparisonDashboardPage /> },
          { path: ROUTES.SUPERVISOR_ANALYTICS_DRILLDOWN, element: <DrillDownDetailPage /> },
          {
            path: ROUTES.SUPERVISOR_NOTIFICATIONS,
            element: <SupervisorNotificationsPage />,
          },
          {
            path: ROUTES.SUPERVISOR_PROFILE,
            element: <SupervisorProfilePage />,
          },
          {
            path: ROUTES.SUPERVISOR_SETTINGS,
            element: <SupervisorPlaceholderPage title="Supervisor Portal Settings" description="Configure evaluation rubrics, notification rules, and default task workflows." />,
          },
        ],
      },
    ],
  },

  // ── Admin & Department Head Routes (HR Admin & Dept Head Shells) ──────────
  {
    element: <RoleGuard allowedRoles={[USER_ROLES.HR_ADMIN, USER_ROLES.DEPARTMENT_HEAD]} />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          // ── HR Admin core pages ──────────────────────────────────────────
          { path: ROUTES.ADMIN_DASHBOARD,     element: <HRDashboard /> },
          { path: ROUTES.ADMIN_INTERNS,        element: <HRInternManagement /> },
          { path: ROUTES.ADMIN_SUPERVISORS,    element: <HRSupervisorManagement /> },
          { path: ROUTES.ADMIN_DEPARTMENTS,    element: <HRDepartmentManagement /> },
          { path: ROUTES.ADMIN_ANNOUNCEMENTS,  element: <HRAnnouncementsManagement /> },
          { path: ROUTES.ADMIN_BATCHES,        element: <HRBatchManagement /> },
          { path: ROUTES.ADMIN_USERS,          element: <HRUserManagement /> },
          { path: ROUTES.ADMIN_REPORTS,        element: <HRReportsShortcut /> },
          { path: ROUTES.ADMIN_PROFILE,        element: <HRProfilePage /> },
          { path: ROUTES.ADMIN_SETTINGS,       element: <HRSettingsPage /> },

          // ── HR Admin analytics & report tools ─────────────────────────
          { path: ROUTES.ADMIN_REPORTS_BUILDER,      element: <ReportBuilderPage /> },
          { path: ROUTES.ADMIN_REPORTS_SAVED,        element: <SavedReportsPage /> },
          { path: ROUTES.ADMIN_REPORTS_EXPORT,       element: <ExportCenterPage /> },
          { path: ROUTES.ADMIN_ANALYTICS_COMPARE,    element: <ComparisonDashboardPage /> },
          { path: ROUTES.ADMIN_ANALYTICS_DRILLDOWN,  element: <DrillDownDetailPage /> },

          // ── Department Head Portal routes (/department-head/*) ──────────
          { path: ROUTES.DEPARTMENT_HEAD_DASHBOARD,      element: <DepartmentHeadDashboard /> },
          { path: ROUTES.DEPARTMENT_HEAD_SUPERVISORS,    element: <DepartmentHeadSupervisors /> },
          { path: ROUTES.DEPARTMENT_HEAD_INTERNS,        element: <DepartmentHeadInterns /> },
          { path: ROUTES.DEPARTMENT_HEAD_TASKS,          element: <DepartmentHeadTasks /> },
          { path: ROUTES.DEPARTMENT_HEAD_REVIEWS,        element: <DepartmentHeadReviews /> },
          { path: ROUTES.DEPARTMENT_HEAD_ANALYTICS,      element: <DepartmentHeadAnalytics /> },
          { path: ROUTES.DEPARTMENT_HEAD_APPROVALS,      element: <DepartmentHeadApprovals /> },
          { path: ROUTES.DEPARTMENT_HEAD_ANNOUNCEMENTS,  element: <DepartmentHeadAnnouncements /> },
          { path: ROUTES.DEPARTMENT_HEAD_NOTIFICATIONS,  element: <DepartmentHeadNotifications /> },
          { path: ROUTES.DEPARTMENT_HEAD_PROFILE,        element: <DepartmentHeadProfile /> },
          { path: ROUTES.DEPARTMENT_HEAD_SETTINGS,       element: <DepartmentHeadSettings /> },
        ],
      },
    ],
  },


  // ── Catch-all ──────────────────────────────────────────────────────────────
  { path: ROUTES.NOT_FOUND, element: <NotFound /> },
]);

export default router;
