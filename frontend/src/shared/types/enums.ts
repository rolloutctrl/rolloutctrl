export const Operator = {
  EQUALS: 'EQUALS',
  IN: 'IN',
  INCLUDES: 'INCLUDES',
  GT: 'GT',
  LT: 'LT',
  GTE: 'GTE',
  LTE: 'LTE',
  CONTAINS: 'CONTAINS',
  STARTS_WITH: 'STARTS_WITH',
  ENDS_WITH: 'ENDS_WITH',
} as const;

export type Operator = (typeof Operator)[keyof typeof Operator];

export const ActionEffect = {
  ALLOW: 'ALLOW',
  DENY: 'DENY',
} as const;

export type ActionEffect = (typeof ActionEffect)[keyof typeof ActionEffect];

export const MatchType = {
  ALL: 'ALL',
  ANY: 'ANY',
} as const;

export type MatchType = (typeof MatchType)[keyof typeof MatchType];

export const ApiKeyType = {
  CLIENT: 'CLIENT',
  SERVER: 'SERVER',
} as const;

export type ApiKeyType = (typeof ApiKeyType)[keyof typeof ApiKeyType];

export const OrganizationRole = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
} as const;

export type OrganizationRole =
  (typeof OrganizationRole)[keyof typeof OrganizationRole];

export const TeamRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  DEVELOPER: 'DEVELOPER',
  VIEWER: 'VIEWER',
} as const;

export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole];

export const PermissionCode = {
  // ===== ORGANIZATION =====
  ORG_MANAGE: 'org.manage',

  ORG_MEMBERS_READ: 'org.members.read',
  ORG_MEMBERS_INVITE: 'org.members.invite',
  ORG_MEMBERS_UPDATE: 'org.members.update',
  ORG_MEMBERS_REMOVE: 'org.members.remove',

  ORG_ROLES_MANAGE: 'org.roles.manage',

  // ===== PROJECT =====
  PROJECT_CREATE: 'project.create',
  PROJECT_READ: 'project.read',
  PROJECT_READ_ALL: 'project.read.all',
  PROJECT_UPDATE: 'project.update',
  PROJECT_DELETE: 'project.delete',
  PROJECT_CONTEXTS_READ: 'project.contexts.read',

  PROJECT_MEMBERS_MANAGE: 'project.members.manage',

  // ===== PROJECT LOGS =====
  PROJECT_LOGS_REED: 'project.logs.reed',

  // ===== ENVIRONMENT =====
  ENV_READ: 'env.read',
  ENV_CREATE: 'env.create',
  ENV_UPDATE: 'env.update',
  ENV_DELETE: 'env.delete',

  // ===== FEATURE FLAG =====
  FLAG_CREATE: 'flag.create',
  FLAG_READ: 'flag.read',
  FLAG_UPDATE: 'flag.update',
  FLAG_DELETE: 'flag.delete',

  FLAG_TOGGLE: 'flag.toggle',
  FLAG_ROLLOUT_UPDATE: 'flag.rollout.update',
  FLAG_TARGETING_UPDATE: 'flag.targeting.update',
  FLAG_TOGGLE_FAVORITE: 'flag.toggle.favorite',

  // ===== FEATURE FLAG STRATEGY =====
  FLAG_STRATEGY_CREATE: 'flag.strategy.create',
  FLAG_STRATEGY_READ: 'flag.strategy.read',
  FLAG_STRATEGY_UPDATE: 'flag.strategy.update',
  FLAG_STRATEGY_DELETE: 'flag.strategy.delete',

  FLAG_STRATEGY_TOGGLE: 'flag.strategy.toggle',

  // ===== FEATURE FLAG METRICS =====
  FLAG_METRICS_READ: 'flag.metrics.read',

  // ===== SEGMENT ===== //
  SEGMENT_CREATE: 'segment.create',
  SEGMENT_READ: 'segment.read',
  SEGMENT_UPDATE: 'segment.update',
  SEGMENT_DELETE: 'segment.delete',

  // ===== ACTION =====
  ACTION_CREATE: 'action.create',
  ACTION_READ: 'action.read',
  ACTION_UPDATE: 'action.update',
  ACTION_DELETE: 'action.delete',
  ACTION_TOGGLE: 'action.toggle',

  // ===== VARIANTS =====
  VARIANT_CREATE: 'variant.create',
  VARIANT_READ: 'variant.read',
  VARIANT_UPDATE: 'variant.update',
  VARIANT_DELETE: 'variant.delete',

  // ===== AUDIT =====
  AUDIT_READ: 'audit.read',
  AUDIT_EXPORT: 'audit.export',

  // ===== API KEYS =====
  API_KEY_CREATE: 'api_key.create',
  API_KEY_READ: 'api_key.read',
  API_KEY_REVOKE: 'api_key.revoke',

  ALL: '*',
} as const;

export type PermissionCode =
  (typeof PermissionCode)[keyof typeof PermissionCode];

export const MetricType = {
  FLAG_EVALUATION: 'FLAG_EVALUATION',
  FLAG_ENABLED: 'FLAG_ENABLED',
  FLAG_DISABLED: 'FLAG_DISABLED',

  STRATEGY_MATCH: 'STRATEGY_MATCH',

  VARIANT_EXPOSURE: 'VARIANT_EXPOSURE',
} as const;

export type MetricType = (typeof MetricType)[keyof typeof MetricType];

export const AuditAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  ENABLE: 'ENABLE',
  DISABLE: 'DISABLE',
  REVOKE: 'REVOKE',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export const ResourceType = {
  FLAG: 'FLAG',
  ACTION: 'ACTION',
  STRATEGY: 'STRATEGY',
  SEGMENT: 'SEGMENT',
  VARIANT: 'VARIANT',
  STRATEGY_VARIANT: 'STRATEGY_VARIANT',
  ENVIRONMENT: 'ENVIRONMENT',
  API_KEY: 'API_KEY',
  PROJECT: 'PROJECT',
} as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export const VariantPayloadType = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  JSON: 'JSON',
} as const;

export type VariantPayloadType =
  (typeof VariantPayloadType)[keyof typeof VariantPayloadType];

export const NotificationChannel = {
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
  SLACK: 'SLACK',
  TELEGRAM: 'TELEGRAM',
  WEBHOOK: 'WEBHOOK',
} as const;

export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationDeliveryStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;

export type NotificationDeliveryStatus =
  (typeof NotificationDeliveryStatus)[keyof typeof NotificationDeliveryStatus];

export const NotificationStatus = {
  UNREAD: 'UNREAD',
  READ: 'READ',
  ARCHIVED: 'ARCHIVED',
} as const;

export type NotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const NotificationSeverity = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
} as const;

export type NotificationSeverity =
  (typeof NotificationSeverity)[keyof typeof NotificationSeverity];

export const NotificationType = {
  INVITATION: 'INVITATION',
  APPROVAL: 'APPROVAL',
  FEATURE_FLAG: 'FEATURE_FLAG',
  ORGANIZATION: 'ORGANIZATION',
  PROJECT: 'PROJECT',
  API_KEY: 'API_KEY',
  BILLING: 'BILLING',
  SECURITY: 'SECURITY',
  SYSTEM: 'SYSTEM',
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
