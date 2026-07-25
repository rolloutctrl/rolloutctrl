# API Reference

All management API endpoints are prefixed with `/api`. SDK endpoints are under
`/api/sdk/client`.

## Authentication

### JWT (management API)

Management endpoints require a JWT access token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

The access token is obtained via `POST /api/auth/login` and refreshed via
`GET /api/auth/refresh` (using the `refreshToken` HttpOnly cookie).

### API Key (SDK + evaluation endpoints)

SDK and evaluation endpoints require an API key in the `x-api-key` header:

```
x-api-key: <your-api-key>
```

API keys are project-scoped and come in two types:

| Type | Scope | Origin check |
| --- | --- | --- |
| `SERVER` | Server-to-server | No |
| `CLIENT` | Browser/frontend | Yes (against `allowedOrigins`) |

---

## Auth

### `POST /api/auth/login`

Authenticate with email and password. Sets a `refreshToken` HttpOnly cookie
and returns an access token.

```json
// Request body
{
  "email": "admin@rolloutctrl.local",
  "password": "@Rollout123"
}
```

```json
// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### `GET /api/auth/refresh`

Refresh the access token. Uses the `refreshToken` cookie. If the refresh token
is expired, a new one is issued and set via cookie.

**Guards:** `JwtRefreshGuard`

```json
// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### `POST /api/auth/logout`

Revoke the current session and clear the refresh token cookie.

**Guards:** `JwtAuthGuard`

### `GET /api/auth/sessions`

List all active sessions for the current user.

**Guards:** `JwtAuthGuard`

### `GET /api/auth/me`

Get the current authenticated user payload.

**Guards:** `JwtAuthGuard`

---

## Users

### `GET /api/users/roles`

Get available team roles and their permissions.

**Guards:** `JwtAuthGuard`

### `POST /api/users`

Create a new user (requires project member management permission).

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `PROJECT_MEMBERS_MANAGE`

### `PATCH /api/users`

Update the current user's profile.

**Guards:** `JwtAuthGuard`

### `PATCH /api/users/password`

Change the current user's password.

**Guards:** `JwtAuthGuard`

### `DELETE /api/users`

Delete the current user's account.

**Guards:** `JwtAuthGuard`

---

## Organizations

### `GET /api/organizations`

Get the current user's organization.

**Guards:** `JwtAuthGuard`

### `GET /api/organizations/members`

List organization members.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ORG_MEMBERS_READ`

### `GET /api/organizations/:organizationId`

Get organization by ID.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard`

### `PATCH /api/organizations/:organizationId`

Update organization.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ORG_MANAGE`

### `POST /api/organizations/:organizationId/members`

Invite/add a member to the organization.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ORG_MEMBERS_INVITE`

### `PATCH /api/organizations/:organizationId/members/:userId`

Update a member's organization role.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ORG_MEMBERS_UPDATE`

### `DELETE /api/organizations/:organizationId/members/:userId`

Remove a member from the organization.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ORG_MEMBERS_REMOVE`

### `POST /api/organizations/:organizationId/transfer-ownership`

Transfer organization ownership to another member.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ORG_MANAGE`

---

## Projects

### `GET /api/projects`

List projects accessible to the current user.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `PROJECT_READ`

### `GET /api/projects/:projectId`

Get project by ID.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `PROJECT_READ`

### `GET /api/projects/:projectId/search?q=...`

Search within a project (flags, segments, actions).

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `PROJECT_READ`

### `GET /api/projects/:projectId/overview`

Get project overview (counts, stats).

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `PROJECT_READ`

### `GET /api/projects/:projectId/members`

List project members.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `PROJECT_MEMBERS_MANAGE`

### `GET /api/projects/:projectId/api-keys`

List API keys for a project.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `PROJECT_READ`

### `POST /api/projects`

Create a new project.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `PROJECT_CREATE`

### `PATCH /api/projects`

Update a project.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `PROJECT_UPDATE`

### `PATCH /api/projects/:projectId/member-access`

Update a project member's role.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `PROJECT_MEMBERS_MANAGE`

### `POST /api/projects/:projectId/api-keys`

Create a new API key for a project.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `API_KEY_CREATE`

### `PATCH /api/projects/:projectId/api-keys/:keyId/revoke`

Revoke an API key.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `API_KEY_REVOKE`

### `DELETE /api/projects/:projectId`

Delete a project.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `PROJECT_DELETE`

### `DELETE /api/projects/:projectId/api-keys/:keyId/delete`

Delete an API key.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `API_KEY_REVOKE`

---

## Environments

### `GET /api/environments/project/:projectId`

List environments for a project.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ENV_READ`

### `GET /api/environments/:environmentId?projectId=...`

Get a single environment.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ENV_READ`

### `POST /api/environments`

Create an environment.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ENV_CREATE`

### `PATCH /api/environments/:environmentId`

Update an environment.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ENV_UPDATE`

### `DELETE /api/environments/:environmentId?projectId=...`

Delete an environment.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ENV_DELETE`

---

## Feature Flags

### `GET /api/feature-flags/project/:projectId`

List feature flags for a project. Supports pagination (`cursor`, `limit`) and
`includeArchived=true`.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_READ`

### `GET /api/feature-flags/:flagId?projectId=...`

Get a single feature flag with its environment configurations.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_READ`

### `POST /api/feature-flags`

Create a feature flag (single or multiple).

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_CREATE`

```json
// Single flag
{
  "projectId": "...",
  "key": "new-dashboard",
  "description": "Enable new dashboard"
}

// Multiple flags
{
  "projectId": "...",
  "type": "multiple",
  "flags": [
    { "key": "flag-a", "description": "Flag A" },
    { "key": "flag-b", "description": "Flag B" }
  ]
}
```

### `PATCH /api/feature-flags/:flagId`

Update a feature flag.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_UPDATE`

### `POST /api/feature-flags/configure`

Configure a flag for a specific environment (enable/disable, set strategies).

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_UPDATE`

### `PATCH /api/feature-flags/:flagId/toggle-favorite`

Toggle the favorite status of a flag.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_UPDATE`

### `DELETE /api/feature-flags/:flagId?projectId=...`

Archive/delete a feature flag.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_DELETE`

---

## Strategies

### `POST /api/strategies`

Create a strategy for a feature flag environment.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_STRATEGY_CREATE`

### `GET /api/strategies/environment/:featureFlagEnvironmentId`

List strategies for a feature flag environment.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_STRATEGY_READ`

### `GET /api/strategies/:strategyId`

Get a single strategy.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_STRATEGY_READ`

### `PATCH /api/strategies/:strategyId`

Update a strategy.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_STRATEGY_UPDATE`

### `POST /api/strategies/:strategyId/toggle-enable`

Enable/disable a strategy.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_STRATEGY_TOGGLE`

### `DELETE /api/strategies/:strategyId?projectId=...`

Delete a strategy.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_STRATEGY_DELETE`

### `PATCH /api/strategies/environment/:featureFlagEnvironmentId/reorder`

Reorder strategies by priority.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_STRATEGY_UPDATE`

### Strategy Rules

| Method | Endpoint | Permission |
| --- | --- | --- |
| `POST` | `/api/strategies/rules` | `FLAG_STRATEGY_UPDATE` |
| `GET` | `/api/strategies/:strategyId/rules` | `FLAG_STRATEGY_READ` |
| `PATCH` | `/api/strategies/rules/:ruleId` | `FLAG_STRATEGY_UPDATE` |
| `DELETE` | `/api/strategies/rules/:ruleId` | `FLAG_STRATEGY_DELETE` |

### Strategy Variants

| Method | Endpoint | Permission |
| --- | --- | --- |
| `GET` | `/api/strategies/:strategyId/variants` | `FLAG_STRATEGY_READ` |
| `POST` | `/api/strategies/:strategyId/variants` | `FLAG_STRATEGY_UPDATE` |
| `POST` | `/api/strategies/:strategyId/variants/batch` | `FLAG_STRATEGY_UPDATE` |
| `PATCH` | `/api/strategies/:strategyId/variants/:variantId` | `FLAG_STRATEGY_UPDATE` |
| `DELETE` | `/api/strategies/:strategyId/variants/:variantId` | `FLAG_STRATEGY_UPDATE` |

---

## Segments

### `POST /api/segments`

Create a segment.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `SEGMENT_CREATE`

### `GET /api/segments/project/:projectId`

List segments for a project.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `SEGMENT_READ`

### `GET /api/segments/:segmentId?projectId=...`

Get a single segment.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `SEGMENT_READ`

### `PATCH /api/segments/:segmentId`

Update a segment.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `SEGMENT_UPDATE`

### `DELETE /api/segments/:segmentId`

Delete a segment.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `SEGMENT_DELETE`

### `POST /api/segments/copy-to-project`

Copy a segment to another project.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `SEGMENT_CREATE`

### Segment Rules

| Method | Endpoint | Permission |
| --- | --- | --- |
| `POST` | `/api/segments/rules` | `SEGMENT_CREATE` |
| `GET` | `/api/segments/:segmentId/rules` | `SEGMENT_READ` |
| `PATCH` | `/api/segments/rules/:ruleId` | `SEGMENT_UPDATE` |
| `DELETE` | `/api/segments/rules/:ruleId` | `SEGMENT_DELETE` |

---

## Actions

### `POST /api/actions`

Create an action (access control rule).

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ACTION_CREATE`

### `GET /api/actions/project/:projectId`

List actions for a project. Supports pagination (`cursor`, `limit`).

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ACTION_READ`

### `GET /api/actions/:actionId?projectId=...`

Get a single action.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ACTION_READ`

### `PATCH /api/actions/:actionId`

Update an action.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ACTION_UPDATE`

### `PATCH /api/actions/:actionId/reorder`

Reorder action strategies by priority.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ACTION_UPDATE`

### `DELETE /api/actions/:actionId?projectId=...`

Delete an action.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `ACTION_DELETE`

---

## Variants

### `GET /api/variants/flag/:flagId?projectId=...`

List variants for a feature flag.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `VARIANT_READ`

### `POST /api/variants/flag/:flagId`

Create a variant for a feature flag.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `VARIANT_CREATE`

### `PATCH /api/variants/:variantId`

Update a variant.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `VARIANT_UPDATE`

### `DELETE /api/variants/:variantId?projectId=...`

Delete a variant.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `VARIANT_DELETE`

### `GET /api/variants/:variantId?projectId=...`

Get a single variant.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `VARIANT_READ`

---

## Metrics

### `GET /api/metrics/flags/:flagId/metrics`

Get flag evaluation metrics. Supports `from`, `to` (ISO dates), `projectId`,
`environmentId` query params.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_METRICS_READ`

### `GET /api/metrics/flags/:flagId/strategies/metrics`

Get per-strategy metrics for a flag.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_METRICS_READ`

### `GET /api/metrics/flags/:flagId/variants/metrics`

Get per-variant metrics for a flag.

**Guards:** `JwtAuthGuard`, `RoleAccessGuard` — `FLAG_METRICS_READ`

---

## Audit Logs

All audit log endpoints require `JwtAuthGuard`, `RoleAccessGuard` — `AUDIT_READ`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/audit-logs/by-resource/:resourceType/:resourceId` | Logs for a specific resource |
| `GET` | `/api/audit-logs/by-project/:projectId` | Logs for a project |
| `GET` | `/api/audit-logs/by-user/:userId` | Logs for a user |
| `GET` | `/api/audit-logs/:id` | Single log entry |
| `GET` | `/api/audit-logs` | All logs (with query filters) |

---

## Notifications

All notification endpoints require `JwtAuthGuard`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/notifications` | List notifications (supports `status`, `limit`, `cursor`) |
| `GET` | `/api/notifications/unread-count` | Get unread notification count |
| `PATCH` | `/api/notifications/:notificationId/read` | Mark as read |
| `POST` | `/api/notifications/read-all` | Mark all as read |
| `PATCH` | `/api/notifications/:notificationId/archive` | Archive a notification |

---

## Access (Evaluation API)

These endpoints use API key authentication (`x-api-key` header).

### `POST /api/access/evaluate`

Evaluate an action (access control rule). Debug/fallback endpoint.

```json
{
  "roles": ["admin"],
  "action": "user.edit",
  "projectId": "...",
  "environment": "production",
  "userId": "user_123",
  "attributes": { "role": "admin" }
}
```

### `POST /api/access/evaluate/flag`

Evaluate a feature flag server-side.

```json
{
  "flagKey": "new-dashboard",
  "environment": "production",
  "userId": "user_123",
  "attributes": { "country": "US", "subscription": "premium" }
}
```

### `GET /api/access/config?environment=production`

Get the full public config (flags + actions) for an environment.

### `POST /api/access/cache/clear`

Clear all evaluation config caches.

---

## SDK Client API

These endpoints use API key authentication (`x-api-key` header) and are
designed for SDK consumption.

### `GET /api/sdk/client/config?environment=...`

Fetch the full environment config (flags + actions + variants + segments).

### `GET /api/sdk/client/config/changes?environment=...&since=N`

Check if the config version has changed since version `N`.

### `POST /api/sdk/client/evaluations`

Report evaluation metrics in batch.

```json
{
  "evaluations": [
    {
      "type": "FLAG_EXPOSURE",
      "count": 1,
      "featureFlagEnvironmentId": "...",
      "featureFlagId": "...",
      "strategyId": "...",
      "variantId": "..."
    }
  ]
}
```
