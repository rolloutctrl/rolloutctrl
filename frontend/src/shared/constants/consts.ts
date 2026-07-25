import { Operator, TeamRole, VariantPayloadType } from '../types/enums';
import type { OperatorConfig } from '../types/types';

export const AUTH_TOKEN_KEY = 'authorizationToken';

export const getCurrentUserQueryKey = 'getCurrentUser';

export const getProjectsQueryKey = 'getProjects';
export const getProjectByIdQueryKey = 'getProjectById';
export const getFeatureFlagsByProjectIdQueryKey = 'getFeatureFlagsByProjectId';
export const getFeatureFlagByIdQueryKey = 'getFeatureFlagById';
export const getOrganizationQueryKey = 'getOrganization';
export const getMyOrganizationsQueryKey = 'getMyOrganizations';
export const getSegmentsByProjectIdQueryKey = 'getSegmentsByProjectId';
export const getSegmentByIdQueryKey = 'getSegmentById';
export const getActionsByProjectIdQueryKey = 'getActionsByProjectId';
export const getEnvironmentsByProjectIdQueryKey = 'getEnvironmentsByProjectId';
export const getEnvironmentByIdQueryKey = 'getEnvironmentById';
export const getOrganizationMembersQueryKey = 'getOrganizationMembers';
export const getRolesWithPermissionsQueryKey = 'getRolesWithPermissions';
export const getProjectOverviewByIdQueryKey = 'getProjectOverviewById';
export const getActionByIdQueryKey = 'getActionById';
export const getProjectMembersQueryKey = 'getProjectMembers';
export const getProjectApiKeysQueryKey = 'getProjectApiKeys';
export const getStrategyByIdQueryKey = 'getStrategyById';
export const getVariantsByFlagIdQueryKey = 'getVariantsByFlagId';
export const getFlagMetricsByIdQueryKey = 'getFlagMetricsById';
export const getFlagStrategyMetricsByIdQueryKey = 'getFlagStrategyMetricsById';
export const getFlagVariantsMetricsByIdQueryKey = 'getFlagVariantsMetricsById';
export const getAuditLogsQueryKey = 'getAuditLogs';
export const getContextsQueryKey = 'getContexts';
export const searchInProjectQueryKey = 'searchInProject';
export const getContextFilterOptionsQueryKey = 'getContextFilterOptions';
export const getExperimentsByFlagIdQueryKey = 'getExperimentsByFlagId';
export const getExperimentByIdQueryKey = 'getExperimentById';
export const getExperimentExposuresByIdQueryKey = 'getExperimentExposuresById';
export const getStrategyVariantsQueryKey = 'getStrategyVariants';
export const getExperimentResultQueryKey = 'getExperimentResult';
export const getBillingPlansQueryKey = 'getBillingPlans';
export const getBillingSummaryQueryKey = 'getBillingSummary';
export const getInvoicesQueryKey = 'getInvoices';
export const getNotificationsQueryKey = 'getNotifications';
export const getUnreadNotificationCountQueryKey = 'getUnreadNotificationCount';

export const OPERATOR_CONFIG: Record<Operator, OperatorConfig> = {
  [Operator.EQUALS]: {
    supportsNot: true,
    label: 'equals',
    notLabel: 'not equals',
  },

  [Operator.IN]: {
    supportsNot: true,
    label: 'in',
    notLabel: 'not in',
    validate: (value) => Array.isArray(value),

    errorMessage: 'Value must be an array',
  },

  [Operator.INCLUDES]: {
    supportsNot: true,
    label: 'includes',
    notLabel: 'not includes',
    validate: (value) => Array.isArray(value) || typeof value === 'string',

    errorMessage: 'Value must be an array or string',
  },

  [Operator.GT]: {
    supportsNot: true,
    label: '>',
    notLabel: '≤',
  },

  [Operator.LT]: {
    supportsNot: true,
    label: '<',
    notLabel: '≥',
  },

  [Operator.GTE]: {
    supportsNot: true,
    label: '≥',
    notLabel: '<',
  },

  [Operator.LTE]: {
    supportsNot: true,
    label: '≤',
    notLabel: '>',
  },

  [Operator.CONTAINS]: {
    supportsNot: true,
    label: 'contains',
    notLabel: 'not contains',
  },

  [Operator.STARTS_WITH]: {
    supportsNot: true,
    label: 'starts with',
    notLabel: 'not starts with',
  },

  [Operator.ENDS_WITH]: {
    supportsNot: true,
    label: 'ends with',
    notLabel: 'not ends with',
  },
};

export const roleDescriptions: Record<TeamRole, string> = {
  [TeamRole.OWNER]:
    'Full, unrestricted access to the project and all its resources, including environments, feature flags, segments, API keys, project members, roles, audit logs, and project settings. This role cannot be modified or removed.',

  [TeamRole.ADMIN]:
    'Administrative access to the project. Can manage project members and roles, environments, feature flags, segments, API keys, audit logs, and project settings. Cannot transfer ownership or perform owner-only actions.',

  [TeamRole.DEVELOPER]:
    'Can create, update, delete, and manage feature flags, environments, segments, targeting rules, rollouts, variants, and actions. Has access to project resources required for day-to-day development, but cannot manage project members, roles, or sensitive project settings.',

  [TeamRole.VIEWER]:
    'Read-only access to project resources, including environments, feature flags, segments, targeting rules, actions, API keys, and audit logs. Cannot create, modify, or delete any project resources.',
};

export const payloadTypeOptions = Object.values(VariantPayloadType).map(
  (value) => ({
    value,
    label: value,
  }),
);

export const variantColorsHex = [
  '#15AABF',
  '#E64980',
  '#FD7E14',
  '#BE4BDB',
  '#0CA678',
  '#FAB005',
  '#4C6EF5',
  '#82C91E',
];

export const VARIANT_COLORS = [
  'cyan',
  'pink',
  'orange',
  'grape',
  'teal',
  'yellow',
  'indigo',
  'lime',
];

export const predefinedRuleFields = [
  'userId',
  'email',
  'organizationId',
  'plan',
  'subscription',
  'country',
  'role',
  'region',
  'language',
  'locale',
  'timezone',
  'environment',
  'appVersion',
  'platform',
  'deviceType',
  'os',
  'browser',
  'ip',
  'sessionId',
] as const;

export const predefinedRuleFieldOptions = predefinedRuleFields.map((value) => ({
  value,
  label: value,
}));

export const payloadBooleanOptions = [
  {
    value: 'true',
    label: 'true',
  },
  {
    value: 'false',
    label: 'false',
  },
];
