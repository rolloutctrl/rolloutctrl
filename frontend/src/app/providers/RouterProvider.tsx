import { lazy, Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { FullscreenLoader, Layout } from '../../shared/ui';
import { navigationRoutes } from '@/shared/routes/navigationRoutes';
import { Header } from '@/widgets/Header';
import { ProjectNavBar } from '@/widgets/Project/ProjectNavBar';
import { PrivateRoute } from '@/features/Auth/PrivateRoute';
import { Footer } from '@/widgets/Footer';

const HomePage = lazy(() =>
  import('@/pages/Home').then((module) => ({
    default: module.HomePage,
  })),
);

const LoginPage = lazy(() =>
  import('@/pages/Login').then((module) => ({
    default: module.LoginPage,
  })),
);

const ProjectPage = lazy(() =>
  import('@/pages/Project').then((module) => ({
    default: module.ProjectPage,
  })),
);

const FeatureFlagsPage = lazy(() =>
  import('@/pages/FeatureFlags').then((module) => ({
    default: module.FeatureFlagsPage,
  })),
);

const CreateFeatureFlagStrategyPage = lazy(() =>
  import('@/pages/CreateFeatureFlagStrategy').then((module) => ({
    default: module.CreateFeatureFlagStrategyPage,
  })),
);

const EditFeatureFlagStrategyPage = lazy(() =>
  import('@/pages/EditFeatureFlagStrategy').then((module) => ({
    default: module.EditFeatureFlagStrategyPage,
  })),
);

const ActionsPage = lazy(() =>
  import('@/pages/Actions').then((module) => ({
    default: module.ActionsPage,
  })),
);

const ApiKeysPage = lazy(() =>
  import('@/pages/ApiKeys').then((module) => ({
    default: module.ApiKeysPage,
  })),
);

const ActionPage = lazy(() =>
  import('@/pages/Action').then((module) => ({
    default: module.ActionPage,
  })),
);

const FeatureFlagPage = lazy(() =>
  import('@/pages/FeatureFlag').then((module) => ({
    default: module.FeatureFlagPage,
  })),
);

const SegmentsPage = lazy(() =>
  import('@/pages/Segments').then((module) => ({
    default: module.SegmentsPage,
  })),
);

const SettingsPage = lazy(() =>
  import('@/pages/Settings').then((module) => ({
    default: module.SettingsPage,
  })),
);

const EnvironmentsPage = lazy(() =>
  import('@/pages/Environments').then((module) => ({
    default: module.EnvironmentsPage,
  })),
);

const ProjectSettingsPage = lazy(() =>
  import('@/pages/ProjectSettings').then((module) => ({
    default: module.ProjectSettingsPage,
  })),
);

const AuditLogsPage = lazy(() =>
  import('@/pages/AuditLogs').then((module) => ({
    default: module.AuditLogsPage,
  })),
);

const withSuspense = (
  Component: React.LazyExoticComponent<() => React.JSX.Element>,
) => (
  <Suspense fallback={<FullscreenLoader />}>
    <Component />
  </Suspense>
);

export const RouterProvider = () => {
  const routes = useRoutes([
    {
      element: (
        <PrivateRoute>
          <Layout headerSlot={<Header withoutNavBar />} footerSlot={<Footer />} withoutNavBar />
        </PrivateRoute>
      ),
      children: [
        {
          path: navigationRoutes.home,
          element: withSuspense(HomePage),
        },
        {
          path: navigationRoutes.settingsTab(':settingsTab'),
          element: withSuspense(SettingsPage),
        },
        {
          path: '/settings',
          element: (
            <Navigate to={navigationRoutes.settingsTab('profile')} replace />
          ),
        },
      ],
    },
    {
      element: (
        <PrivateRoute>
          <Layout headerSlot={<Header />} navBarSlot={<ProjectNavBar />} footerSlot={<Footer />} />
        </PrivateRoute>
      ),
      children: [
        {
          path: navigationRoutes.project(':projectId'),
          element: withSuspense(ProjectPage),
        },
        {
          path: navigationRoutes.featureFlags(':projectId'),
          element: withSuspense(FeatureFlagsPage),
        },
        {
          path: navigationRoutes.actions(':projectId'),
          element: withSuspense(ActionsPage),
        },
        {
          path: navigationRoutes.action(':projectId', ':actionId'),
          element: withSuspense(ActionPage),
        },
        {
          path: navigationRoutes.environments(':projectId'),
          element: withSuspense(EnvironmentsPage),
        },
        {
          path: navigationRoutes.segments(':projectId'),
          element: withSuspense(SegmentsPage),
        },
        {
          path: navigationRoutes.apiKeys(':projectId'),
          element: withSuspense(ApiKeysPage),
        },
        {
          path: navigationRoutes.auditLogs(':projectId'),
          element: withSuspense(AuditLogsPage),
        },
        {
          path: navigationRoutes.projectSettingsTab(':projectId'),
          element: withSuspense(ProjectSettingsPage),
        },
        {
          path: navigationRoutes.projectTab(':projectId', ':projectTab'),
          element: withSuspense(ProjectPage),
        },
        {
          path: navigationRoutes.featureFlag(':projectId', ':featureFlagId'),
          element: withSuspense(FeatureFlagPage),
        },
        {
          path: navigationRoutes.featureFlagVariants(
            ':projectId',
            ':featureFlagId',
            ':featureFlagTab',
          ),
          element: withSuspense(FeatureFlagPage),
        },
        {
          path: navigationRoutes.addFeatureFlagStrategy(
            ':projectId',
            ':featureFlagId',
          ),
          element: withSuspense(CreateFeatureFlagStrategyPage),
        },
        {
          path: navigationRoutes.editFeatureFlagStrategy(
            ':projectId',
            ':featureFlagId',
            ':strategyId',
          ),
          element: withSuspense(EditFeatureFlagStrategyPage),
        },
        {
          path: '*',
          element: <Navigate to={navigationRoutes.home} replace />,
        },
      ],
    },
    {
      element: <Layout isOnePage />,
      children: [
        {
          path: navigationRoutes.login,
          element: withSuspense(LoginPage),
        },
      ],
    },
  ]);

  return routes;
};
