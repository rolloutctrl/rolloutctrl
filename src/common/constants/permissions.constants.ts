import { OrganizationRole, TeamRole } from '../generated/prisma/enums';

export enum PermissionCode {
  // ===== ORGANIZATION =====
  ORG_MANAGE = 'org.manage',

  ORG_MEMBERS_READ = 'org.members.read',
  ORG_MEMBERS_INVITE = 'org.members.invite',
  ORG_MEMBERS_REMOVE = 'org.members.remove',
  ORG_MEMBERS_UPDATE = 'org.members.update',

  ORG_ROLES_MANAGE = 'org.roles.manage',

  // ===== PROJECT =====
  PROJECT_CREATE = 'project.create',
  PROJECT_READ = 'project.read',
  PROJECT_READ_ALL = 'project.read.all',
  PROJECT_UPDATE = 'project.update',
  PROJECT_DELETE = 'project.delete',
  PROJECT_MEMBERS_MANAGE = 'project.members.manage',
  PROJECT_LOGS_REED = 'project.logs.reed',

  // ===== ENVIRONMENT =====
  ENV_READ = 'env.read',
  ENV_CREATE = 'env.create',
  ENV_UPDATE = 'env.update',
  ENV_DELETE = 'env.delete',

  // ===== FEATURE FLAG =====
  FLAG_CREATE = 'flag.create',
  FLAG_READ = 'flag.read',
  FLAG_UPDATE = 'flag.update',
  FLAG_DELETE = 'flag.delete',

  FLAG_TOGGLE = 'flag.toggle',
  FLAG_TOGGLE_FAVORITE = 'flag.toggle.favorite',
  FLAG_ROLLOUT_UPDATE = 'flag.rollout.update',
  FLAG_TARGETING_UPDATE = 'flag.targeting.update',

  // ===== FEATURE FLAG STRATEGY =====
  FLAG_STRATEGY_CREATE = 'flag.strategy.create',
  FLAG_STRATEGY_READ = 'flag.strategy.read',
  FLAG_STRATEGY_UPDATE = 'flag.strategy.update',
  FLAG_STRATEGY_DELETE = 'flag.strategy.delete',

  FLAG_STRATEGY_TOGGLE = 'flag.strategy.toggle',

  // ===== FEATURE FLAG METRICS =====
  FLAG_METRICS_READ = 'flag.metrics.read',

  // ===== SEGMENT ===== //
  SEGMENT_CREATE = 'segment.create',
  SEGMENT_READ = 'segment.read',
  SEGMENT_UPDATE = 'segment.update',
  SEGMENT_DELETE = 'segment.delete',

  // ===== ACTION =====
  ACTION_CREATE = 'action.create',
  ACTION_READ = 'action.read',
  ACTION_UPDATE = 'action.update',
  ACTION_DELETE = 'action.delete',
  ACTION_TOGGLE = 'action.toggle',

  // ===== VARIANTS =====
  VARIANT_CREATE = 'variant.create',
  VARIANT_READ = 'variant.read',
  VARIANT_UPDATE = 'variant.update',
  VARIANT_DELETE = 'variant.delete',

  // ===== AUDIT =====
  AUDIT_READ = 'audit.read',
  AUDIT_EXPORT = 'audit.export',

  // ===== API KEYS =====
  API_KEY_CREATE = 'api_key.create',
  API_KEY_READ = 'api_key.read',
  API_KEY_REVOKE = 'api_key.revoke',

  ALL = '*',
}

const excludedAdminPermissions = [
  PermissionCode.ALL,
  PermissionCode.ORG_MANAGE,
  PermissionCode.ORG_MEMBERS_READ,
  PermissionCode.ORG_MEMBERS_INVITE,
  PermissionCode.ORG_MEMBERS_REMOVE,
  PermissionCode.ORG_MEMBERS_UPDATE,
  PermissionCode.ORG_ROLES_MANAGE,
  PermissionCode.PROJECT_CREATE,
  PermissionCode.PROJECT_DELETE,
  PermissionCode.PROJECT_MEMBERS_MANAGE,
];

const excludedProjectOwnerPermissions = [
  PermissionCode.ALL,
  PermissionCode.ORG_MANAGE,
  PermissionCode.ORG_MEMBERS_READ,
  PermissionCode.ORG_MEMBERS_INVITE,
  PermissionCode.ORG_MEMBERS_REMOVE,
  PermissionCode.ORG_MEMBERS_UPDATE,
  PermissionCode.ORG_ROLES_MANAGE,
  PermissionCode.PROJECT_CREATE,
  PermissionCode.PROJECT_DELETE,
];

const adminPermissions = Object.values(PermissionCode).filter(
  (permission) => !excludedAdminPermissions.includes(permission),
);

const projectOwnerPermissions = Object.values(PermissionCode).filter(
  (permission) => !excludedProjectOwnerPermissions.includes(permission),
);

export const TeamRolePermissions: Record<TeamRole, PermissionCode[]> = {
  [TeamRole.OWNER]: projectOwnerPermissions,

  [TeamRole.ADMIN]: adminPermissions,

  [TeamRole.DEVELOPER]: [
    PermissionCode.PROJECT_READ,
    PermissionCode.ENV_READ,
    PermissionCode.FLAG_READ,
    PermissionCode.FLAG_UPDATE,
    PermissionCode.FLAG_CREATE,
    PermissionCode.FLAG_DELETE,
    PermissionCode.FLAG_TOGGLE,
    PermissionCode.FLAG_ROLLOUT_UPDATE,
    PermissionCode.FLAG_TARGETING_UPDATE,
    PermissionCode.FLAG_STRATEGY_CREATE,
    PermissionCode.FLAG_STRATEGY_READ,
    PermissionCode.FLAG_STRATEGY_UPDATE,
    PermissionCode.FLAG_STRATEGY_DELETE,
    PermissionCode.FLAG_STRATEGY_TOGGLE,
    PermissionCode.FLAG_METRICS_READ,
    PermissionCode.SEGMENT_READ,
    PermissionCode.SEGMENT_CREATE,
    PermissionCode.SEGMENT_UPDATE,
    PermissionCode.SEGMENT_DELETE,
    PermissionCode.ACTION_CREATE,
    PermissionCode.ACTION_READ,
    PermissionCode.ACTION_UPDATE,
    PermissionCode.ACTION_DELETE,
    PermissionCode.ACTION_TOGGLE,
    PermissionCode.VARIANT_READ,
    PermissionCode.VARIANT_CREATE,
    PermissionCode.VARIANT_UPDATE,
    PermissionCode.VARIANT_DELETE,
  ],

  [TeamRole.VIEWER]: [
    PermissionCode.PROJECT_READ,
    PermissionCode.ENV_READ,
    PermissionCode.FLAG_READ,
    PermissionCode.FLAG_STRATEGY_READ,
    PermissionCode.FLAG_METRICS_READ,
    PermissionCode.ACTION_READ,
    PermissionCode.VARIANT_READ,
    PermissionCode.SEGMENT_READ,
  ],
};

export const OrganizationRolePermissions: Record<
  OrganizationRole,
  PermissionCode[]
> = {
  [OrganizationRole.OWNER]: Object.values(PermissionCode),
  [OrganizationRole.MEMBER]: [
    PermissionCode.ORG_MEMBERS_READ,
    PermissionCode.PROJECT_READ,
  ],
};
