# Permissions & Roles

RolloutCtrl uses a two-tier role system: **Organization roles** and **Team
(project) roles**. Each role maps to a set of permissions enforced by the
`RoleAccessGuard`.

## How authorization works

1. Every protected route is decorated with `@RequiredPermissions(...)` specifying
   one or more `PermissionCode` values
2. The `JwtStrategy` loads the user with their organization role and project
   memberships (with team roles)
3. `RoleAccessGuard` checks:
   - **First**: does the user's organization role grant all required permissions?
   - **If not**: does the user have a project membership with a team role that
     grants all required permissions?
4. If neither check passes, the request is rejected with `403 Forbidden`

## Organization roles

| Role | Description |
| --- | --- |
| `OWNER` | Full access to everything in the organization. Can transfer ownership. |
| `MEMBER` | Basic access — can read members, billing, and projects. |

### Organization role permissions

**OWNER** — all permissions (`*`)

**MEMBER**:

- `org.members.read`
- `org.billing.read`
- `project.read`

## Team roles (project-level)

| Role | Description |
| --- | --- |
| `OWNER` | Full project access (cannot create/delete projects or manage org) |
| `ADMIN` | Nearly full project access (excludes org management, project create/delete, member manage) |
| `DEVELOPER` | Can manage flags, strategies, segments, actions, variants, and view metrics |
| `VIEWER` | Read-only access to all project resources |

### Team role permissions

#### OWNER

All permissions except:

- `*` (ALL)
- `org.manage`
- `org.members.*`
- `org.roles.manage`
- `project.create`
- `project.delete`

#### ADMIN

All permissions except:

- `*` (ALL)
- `org.manage`
- `org.members.*`
- `org.roles.manage`
- `org.billing.manage`
- `project.create`
- `project.delete`
- `project.members.manage`

#### DEVELOPER

- `project.read`
- `env.read`
- `flag.read`
- `flag.update`
- `flag.create`
- `flag.delete`
- `flag.toggle`
- `flag.rollout.update`
- `flag.targeting.update`
- `flag.strategy.create`
- `flag.strategy.read`
- `flag.strategy.update`
- `flag.strategy.delete`
- `flag.strategy.toggle`
- `flag.metrics.read`
- `segment.read`
- `segment.create`
- `segment.update`
- `segment.delete`
- `action.rule.create`
- `action.rule.read`
- `action.rule.update`
- `action.rule.delete`
- `action.rule.toggle`
- `variant.read`
- `variant.create`
- `variant.update`
- `variant.delete`

#### VIEWER

- `project.read`
- `env.read`
- `flag.read`
- `flag.strategy.read`
- `flag.metrics.read`
- `action.rule.read`
- `variant.read`
- `segment.read`

## Permission codes reference

### Organization

| Code | Description |
| --- | --- |
| `org.manage` | Manage organization settings |
| `org.members.read` | View organization members |
| `org.members.invite` | Invite members |
| `org.members.remove` | Remove members |
| `org.members.update` | Update member roles |
| `org.roles.manage` | Manage roles |
| `org.billing.read` | View billing info |
| `org.billing.manage` | Manage billing |

### Project

| Code | Description |
| --- | --- |
| `project.create` | Create projects |
| `project.read` | View projects |
| `project.read.all` | View all projects in org |
| `project.update` | Update project settings |
| `project.delete` | Delete projects |
| `project.members.manage` | Manage project members |
| `project.logs.reed` | View project logs |

### Environment

| Code | Description |
| --- | --- |
| `env.read` | View environments |
| `env.create` | Create environments |
| `env.update` | Update environments |
| `env.delete` | Delete environments |

### Feature Flag

| Code | Description |
| --- | --- |
| `flag.create` | Create feature flags |
| `flag.read` | View feature flags |
| `flag.update` | Update feature flags |
| `flag.delete` | Delete feature flags |
| `flag.toggle` | Toggle flag enabled state |
| `flag.toggle.favorite` | Toggle favorite |
| `flag.rollout.update` | Update rollout percentage |
| `flag.targeting.update` | Update targeting rules |

### Feature Flag Strategy

| Code | Description |
| --- | --- |
| `flag.strategy.create` | Create strategies |
| `flag.strategy.read` | View strategies |
| `flag.strategy.update` | Update strategies |
| `flag.strategy.delete` | Delete strategies |
| `flag.strategy.toggle` | Toggle strategy enabled state |

### Feature Flag Metrics

| Code | Description |
| --- | --- |
| `flag.metrics.read` | View flag metrics |

### Segment

| Code | Description |
| --- | --- |
| `segment.create` | Create segments |
| `segment.read` | View segments |
| `segment.update` | Update segments |
| `segment.delete` | Delete segments |

### Action

| Code | Description |
| --- | --- |
| `action.create` | Create actions |
| `action.read` | View actions |
| `action.update` | Update actions |
| `action.delete` | Delete actions |
| `action.toggle` | Toggle action enabled state |

### Variant

| Code | Description |
| --- | --- |
| `variant.create` | Create variants |
| `variant.read` | View variants |
| `variant.update` | Update variants |
| `variant.delete` | Delete variants |

### Audit

| Code | Description |
| --- | --- |
| `audit.read` | View audit logs |
| `audit.export` | Export audit logs |

### API Keys

| Code | Description |
| --- | --- |
| `api_key.create` | Create API keys |
| `api_key.read` | View API keys |
| `api_key.revoke` | Revoke/delete API keys |

### Special

| Code | Description |
| --- | --- |
| `*` | Wildcard — all permissions (org OWNER only) |

## Permission hierarchy diagram

```
Organization
├── OWNER → all permissions (*)
└── MEMBER → org.members.read, org.billing.read, project.read
      │
      └── Projects (TeamRole)
            ├── OWNER → all project permissions
            ├── ADMIN → most project permissions (no member manage)
            ├── DEVELOPER → flags, strategies, segments, actions, variants
            └── VIEWER → read-only
```

## Querying roles via API

```http
GET /api/users/roles
Authorization: Bearer <accessToken>
```

Returns all team roles and their associated permission codes:

```json
[
  {
    "role": "OWNER",
    "permissions": ["project.read", "flag.create", ...]
  },
  {
    "role": "DEVELOPER",
    "permissions": ["project.read", "flag.read", ...]
  }
]
```
