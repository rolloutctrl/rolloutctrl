export const navigationRoutes = {
  home: '/',
  project: (id: string) => `/project/${id}`,
  contexts: (projectId: string) => `/project/${projectId}/contexts`,
  featureFlags: (projectId: string) => `/project/${projectId}/feature-flags`,
  action: (projectId: string, actionId: string) =>
    `/project/${projectId}/actions/${actionId}`,
  actions: (projectId: string) => `/project/${projectId}/actions`,
  apiKeys: (projectId: string) => `/project/${projectId}/api-keys`,
  auditLogs: (projectId: string) => `/project/${projectId}/audit-logs`,
  segments: (projectId: string) => `/project/${projectId}/segments`,
  environments: (projectId: string) => `/project/${projectId}/env`,
  projectTab: (id: string, tab: string) => `/project/${id}/${tab}`,
  projectSettingsTab: (projectId: string) => `/project/${projectId}/settings`,

  featureFlag: (projectId: string, featureFlagId: string) =>
    `/project/${projectId}/feature-flags/${featureFlagId}`,
  addFeatureFlagStrategy: (projectId: string, featureFlagId: string) =>
    `/project/${projectId}/feature-flags/${featureFlagId}/add-strategy`,
  editFeatureFlagStrategy: (
    projectId: string,
    featureFlagId: string,
    strategyId: string,
  ) =>
    `/project/${projectId}/feature-flags/${featureFlagId}/strategies/${strategyId}/edit`,
  featureFlagVariants: (
    projectId: string,
    featureFlagId: string,
    featureFlagTab: string,
  ) => `/project/${projectId}/feature-flags/${featureFlagId}/${featureFlagTab}`,
  addFeatureFlagExperiment: (projectId: string, featureFlagId: string) =>
    `/project/${projectId}/feature-flags/${featureFlagId}/experiments/add-experiment`,
  experiment: (
    projectId: string,
    featureFlagId: string,
    experimentId: string,
  ) =>
    `/project/${projectId}/feature-flags/${featureFlagId}/experiments/${experimentId}`,
  organizationTab: (organizationTab: string) =>
    `/settings/organization/${organizationTab}`,
  settingsTab: (settingsTab: string) => `/settings/${settingsTab}`,
  profile: '/settings/profile',
  organization: '/settings/organization',
  login: '/login',
  githubSuccess: '/auth/github/success',
  confirmEmail: '/auth/confirm-email',
  signup: '/signup',
  invitation: '/invitation',
  billingCheckout: '/billing/checkout',
  billingSuccess: '/billing/success',
  billingError: '/billing/error',
} as const;
