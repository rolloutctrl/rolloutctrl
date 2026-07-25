import type { Nullable } from '../types/types';

export const apiRoutes = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    signUp: '/auth/signup',
    verifyEmail: '/auth/verify-email',
  },
  projects: {
    list: `/projects`,
    create: '/projects',
    update: '/projects',
    delete: (projectId?: string) => `/projects/${projectId}`,
    overview: (projectId?: string) => `/projects/${projectId}/overview`,
    project: (projectId?: string) => `/projects/${projectId}`,
    members: (projectId?: string) => `/projects/${projectId}/members`,
    collectContexts: (projectId?: string) =>
      `/projects/${projectId}/collect-contexts`,
    updatedProjectMemberAccess: (projectId?: string) =>
      `/projects/${projectId}/member-access`,
    search: (projectId?: Nullable<string>) => `/projects/${projectId}/search`,
    apiKeys: (projectId?: string) => `/projects/${projectId}/api-keys`,
    generateApiKey: (projectId?: string) => `/projects/${projectId}/api-keys`,
    revokeApiKey: (projectId?: string, keyId?: string) =>
      `/projects/${projectId}/api-keys/${keyId}/revoke`,
    deleteApiKey: (projectId?: string, keyId?: string) =>
      `/projects/${projectId}/api-keys/${keyId}/delete`,
  },
  environments: {
    environment: (environmentId?: string, projectId?: string) =>
      `/environments/${environmentId}?projectId=${projectId}`,
    list: (projectId?: string) => `/environments/project/${projectId}`,
    create: '/environments',
    update: (environmentId?: string) => `/environments/${environmentId}`,
    delete: (environmentId?: string, projectId?: string) =>
      `/environments/${environmentId}?projectId=${projectId}`,
  },
  featureFlags: {
    create: '/feature-flags',
    update: (flagId?: string) => `/feature-flags/${flagId}`,
    delete: (flagId?: string, projectId?: string) =>
      `/feature-flags/${flagId}?projectId=${projectId}`,
    toggleEnable: '/feature-flags/configure',
    toggleFavorite: (flagId?: string) =>
      `/feature-flags/${flagId}/toggle-favorite`,
  },
  actions: {
    get: (actionId?: string, projectId?: string) =>
      `/actions/${actionId}?projectId=${projectId}`,
    update: (actionId?: string) => `/actions/${actionId}`,
    delete: (actionId?: string) => `/actions/${actionId}`,
    list: (projectId?: string) => `/actions/project/${projectId}`,
    reorder: (actionId?: string) => `/actions/${actionId}/reorder`,
  },
  variants: {
    list: (flagId?: string) => `/variants/flag/${flagId}`,
    create: (flagId?: string) => `/variants/flag/${flagId}`,
    update: (variantId?: string) => `/variants/${variantId}`,
    delete: (variantId?: string) => `/variants/${variantId}`,
  },
  strategies: {
    strategy: (strategyId?: string) => `/strategies/${strategyId}`,
    update: (strategyId?: string) => `/strategies/${strategyId}`,
    delete: (strategyId?: string) => `/strategies/${strategyId}`,
  },
  metrics: {
    flag: (flagId?: string, projectId?: string, environmentId?: string) =>
      `/metrics/flags/${flagId}/metrics${environmentId ? `?environmentId=${environmentId}` : ''}${projectId ? `${environmentId ? '&' : '?'}projectId=${projectId}` : ''}`,
    flagStrategy: (
      flagId?: string,
      projectId?: string,
      environmentId?: string,
    ) =>
      `/metrics/flags/${flagId}/strategies/metrics${environmentId ? `?environmentId=${environmentId}` : ''}${projectId ? `${environmentId ? '&' : '?'}projectId=${projectId}` : ''}`,
    flagVariants: (
      flagId?: string,
      projectId?: string,
      environmentId?: string,
    ) =>
      `/metrics/flags/${flagId}/variants/metrics${environmentId ? `?environmentId=${environmentId}` : ''}${projectId ? `${environmentId ? '&' : '?'}projectId=${projectId}` : ''}`,
  },
  organizations: {
    list: '/organizations',
    create: '/organizations',
    get: '/organizations',
    update: (organizationId?: Nullable<string>) =>
      `/organizations/${organizationId}`,
    getMembers: `/organizations/members`,
    addMember: (organizationId?: Nullable<string>) =>
      `/organizations/${organizationId}/members`,
    updateMember: (
      organizationId?: Nullable<string>,
      userId?: Nullable<string>,
    ) => `/organizations/${organizationId}/members/${userId}`,
    deleteMember: (
      organizationId?: Nullable<string>,
      userId?: Nullable<string>,
    ) => `/organizations/${organizationId}/members/${userId}`,
    transferOwnership: (organizationId?: Nullable<string>) =>
      `/organizations/${organizationId}/transfer-ownership`,
    touch: (organizationId?: Nullable<string>) =>
      `/organizations/${organizationId}/touch`,
    validateInvitation: (token?: Nullable<string>) =>
      `/organizations/invitations/validate/${token}`,
    acceptInvitation: (organizationId?: string) =>
      `/organizations/${organizationId}/invitations/accept`,
    declineInvitation: (organizationId?: string) =>
      `/organizations/${organizationId}/invitations/decline`,
  },
  users: {
    update: '/users',
    delete: '/users',
    roles: '/users/roles',
    changePassword: '/users/password',
  },
  featureFlagRules: {
    list: (projectId?: string, flagId?: string, environmentId?: string) =>
      `/projects/${projectId}/flags/${flagId}/environments/${environmentId}/rules`,
  },
  segments: {
    create: '/segments',
    update: (id?: string) => `/segments/${id}`,
    delete: (id?: string) => `/segments/${id}`,
    segment: (id?: Nullable<string>) => `/segments/${id}`,
    list: (projectId?: string) => `/segments/project/${projectId}`,
    copyToProject: '/segments/copy-to-project',
  },
  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    markAsRead: (notificationId?: string) =>
      `/notifications/${notificationId}/read`,
  },
} as const;
