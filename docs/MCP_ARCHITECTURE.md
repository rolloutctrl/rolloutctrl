# MCP Architecture — RolloutCtrl

> This document describes the architecture of the Model Context Protocol (MCP)
> integration with RolloutCtrl.

## 1. Allowed operations (MCP tools)

| Category | Operation | Service method | Required permissions |
|---|---|---|---|
| **Read** | list flags | `FeatureFlagService.findAllFeatureFlags` | `FLAG_READ` |
| Read | get flag | `FeatureFlagService.findFeatureFlagById` | `FLAG_READ` |
| Read | list environments | `EnvironmentService.findAll` | `ENV_READ` |
| Read | get environment | `EnvironmentService.findOne` | `ENV_READ` |
| Read | get flag config (env) | `FeatureFlagService.getFlagEnvironmentConfig` | `FLAG_READ` |
| Read | get all env configs for flag | `FeatureFlagService.getAllEnvironmentsConfig` | `FLAG_READ` |
| Read | list strategies | `StrategyService.findAllStrategies` | `FLAG_STRATEGY_READ` |
| Read | get strategy | `StrategyService.findStrategyById` | `FLAG_STRATEGY_READ` |
| Read | list strategy rules | `StrategyService.findAllStrategyRules` | `FLAG_STRATEGY_READ` |
| Read | list strategy variants | `StrategyService.findAllStrategyVariants` | `FLAG_STRATEGY_READ` |
| Read | list variants | `VariantService.findAllVariantsByFlagId` | `VARIANT_READ` |
| Read | get variant | `VariantService.findVariantById` | `VARIANT_READ` |
| Read | list segments | `SegmentService.findAllSegments` | `SEGMENT_READ` |
| Read | get segment | `SegmentService.findSegmentById` | `SEGMENT_READ` |
| Read | list actions | `ActionService.findAllActions` | `ACTION_READ` |
| Read | get action | `ActionService.findActionById` | `ACTION_READ` |
| Read | list flag actions (audit by resource) | `AuditLogService.findByResource(FLAG, flagId)` | `AUDIT_READ` |
| **Create/Update** | create flag | `FeatureFlagService.createFeatureFlag` | `FLAG_CREATE` |
| Create/Update | update flag | `FeatureFlagService.updateFeatureFlag` | `FLAG_UPDATE` |
| Create/Update | enable/disable flag (env) | `FeatureFlagService.configureFlagForEnvironment` | `FLAG_TOGGLE` |
| Create/Update | create strategy | `StrategyService.createStrategy` | `FLAG_STRATEGY_CREATE` |
| Create/Update | update strategy | `StrategyService.updateStrategy` | `FLAG_STRATEGY_UPDATE` |
| Create/Update | toggle strategy | `StrategyService.toggleStrategyEnable` | `FLAG_STRATEGY_TOGGLE` |
| Create/Update | create strategy rule | `StrategyService.createStrategyRule` | `FLAG_STRATEGY_UPDATE` |
| Create/Update | update strategy rule | `StrategyService.updateStrategyRule` | `FLAG_STRATEGY_UPDATE` |
| Create/Update | add variant to strategy | `StrategyService.addVariantToStrategy` | `FLAG_STRATEGY_UPDATE` |
| Create/Update | update strategy variant (weight) | `StrategyService.updateStrategyVariant` | `FLAG_STRATEGY_UPDATE` |
| Create/Update | create variant | `VariantService.createVariant` | `VARIANT_CREATE` |
| Create/Update | update variant | `VariantService.updateVariant` | `VARIANT_UPDATE` |
| Create/Update | create segment | `SegmentService.createSegment` | `SEGMENT_CREATE` |
| Create/Update | update segment | `SegmentService.updateSegment` | `SEGMENT_UPDATE` |
| Create/Update | create action | `ActionService.createAction` | `ACTION_CREATE` |
| Create/Update | update action | `ActionService.updateAction` | `ACTION_UPDATE` |

**Note on `configure_rollout` / `configure_targeting`:**
- `rolloutPercentage` and `rolloutStickinessField` are `Strategy` fields, changed via
  `update_strategy` (requires `FLAG_ROLLOUT_UPDATE` per business logic; see 4.3).
- Targeting rules are `StrategyRule`, changed via `update_strategy` (with `rules[]`)
  or the separate `create/update strategy rule` tools (require `FLAG_TARGETING_UPDATE`).
- Separate `configure_rollout` / `configure_targeting` MCP tools are
  **thin wrappers** over `update_strategy`, implemented only if they simplify
  agent UX. Business validation stays in `StrategyService`.

**Note on `execute_flag_action`:**
- An `Action` in RolloutCtrl is an **access control rule** (ALLOW/DENY), not an
  executable action on a flag. "Executing an action" means evaluating access via
  `AccessService.can()`. This is a read-only operation.
- The `evaluate_flag_action` tool (read-only) is a wrapper over `AccessService.can`
  with `projectId` taken from the API key or identity. Allowed only if needed for debugging.

## 2. Forbidden operations (not registered in MCP)

| Category | Forbidden action | Reason |
|---|---|---|
| Delete | `deleteFeatureFlag` | deletion |
| Delete | `archiveFeatureFlag`/`restoreFeatureFlag` | soft delete/restore (via `update_flag` with `archived`) — by default the `archived` field is **forbidden** in MCP `update_flag` |
| Delete | `deleteStrategy` | deletion |
| Delete | `deleteStrategyRule` | deletion (however `update_strategy` with `rules[]` rewrites rules — that is an update, not a delete; allowed) |
| Delete | `removeVariantFromStrategy` | relation deletion |
| Delete | `deleteVariant` | deletion |
| Delete | `deleteSegment` | deletion |
| Delete | `deleteSegmentRule` | deletion |
| Delete | `deleteAction` | deletion |
| Delete | `deleteEnvironment` | deletion |
| Org | `OrganizationService.*` (update, addMember, updateMember, removeMember, transferOwnership) | organization management |
| Project | `ProjectService.create/update/delete` | project create/update/delete |
| Project | `ProjectService.updateProjectMemberAccess` | project member management |
| Project | `ApiKeyService.create/revoke/deleteApiKey` | API key management |
| User | `UserService.createUser/updateUser/changePassword/deleteUser` | user management |
| User | `getRolesWithPermissions` | exposes the role matrix (informational, not needed by the agent) |
| System | `clearAllCache`, `invalidateCache*` directly | system operations (cache is invalidated by services automatically) |
| System | arbitrary HTTP requests to the API | architecturally forbidden (no such tool) |

## 3. AppModule integration

```ts
// app.module.ts
imports: [
  ...,
  McpModule,  // new module
],
```

`McpModule` imports: `FeatureFlagModule`, `StrategyModule`, `VariantModule`,
`EnvironmentModule`, `SegmentModule`, `ActionModule`, `AuditLogModule`, `AuthModule`
(for `JwtAuthGuard`/`JwtStrategy` — via `APP_GUARD` or an explicit `JwtModule` re-export).

## 4. Tool list (with input/output schemas)

> Schemas are shown schematically. Exact JSON Schemas live in `src/modules/mcp/schemas/`.
> All lists support pagination (`cursor`, `limit`) where the service supports it.

### 4.1 Read-only

#### `list_flags`
- **Input:** `{ projectId: string, includeArchived?: boolean, cursor?: string, limit?: number }`
- **Output:** `{ flags: [{ id, key, description, archived, isFavorite, createdAt, updatedAt, project: {id,slug}, environments: [{ id, environment: {id,name}, enabled }] }], nextCursor, hasMore }`
- **Permissions:** `FLAG_READ`
- **Secrets:** none (`createdById` hidden; `createdByName`/`createdByEmail` optional).

#### `get_flag`
- **Input:** `{ projectId: string, flagId: string }` (`flagId` — id or key)
- **Output:** full `FeatureFlag` with `environments` (strategies, variants), `variants`, `project`.
- **Permissions:** `FLAG_READ`

#### `list_environments`
- **Input:** `{ projectId: string }`
- **Output:** `{ environments: [{ id, name, isSystem, version, approveRequired, enabledFlagsCount, project: {id,slug} }] }`
- **Permissions:** `ENV_READ`

#### `get_environment`
- **Input:** `{ projectId: string, environmentId: string }`
- **Output:** environment + `enabledFlagsCount`.
- **Permissions:** `ENV_READ`

#### `get_flag_config`
- **Input:** `{ flagId: string, environmentId: string }`
- **Output:** `FeatureFlagEnvironment` with strategies (rules, segments), environment, featureFlag.
- **Permissions:** `FLAG_READ`

#### `list_strategies`
- **Input:** `{ featureFlagEnvironmentId: string }`
- **Output:** `Strategy[]` (with rules, segments).
- **Permissions:** `FLAG_STRATEGY_READ`

#### `get_strategy`
- **Input:** `{ strategyId: string }`
- **Output:** `Strategy` (with rules, segments, featureFlagEnvironment, environment, featureFlag).
- **Permissions:** `FLAG_STRATEGY_READ`

#### `list_variants`
- **Input:** `{ projectId: string, flagId: string }`
- **Output:** `Variant[]` (with strategyVariants).
- **Permissions:** `VARIANT_READ`

#### `get_variant`
- **Input:** `{ projectId: string, variantId: string }`
- **Output:** `Variant` (with featureFlag, strategyVariants).
- **Permissions:** `VARIANT_READ`

#### `list_segments`
- **Input:** `{ projectId: string }`
- **Output:** `Segment[]` (with rules, project).
- **Permissions:** `SEGMENT_READ`

#### `get_segment`
- **Input:** `{ projectId: string, segmentId: string }`
- **Output:** `Segment` (with rules, project).
- **Permissions:** `SEGMENT_READ`

#### `list_actions`
- **Input:** `{ projectId: string, cursor?: string, limit?: number }`
- **Output:** `{ data: Action[], nextCursor, hasMore }` (with strategies, rules, segments).
- **Permissions:** `ACTION_READ`

#### `get_action`
- **Input:** `{ projectId: string, actionId: string }` (`actionId` — id or key)
- **Output:** `Action` (with strategies).
- **Permissions:** `ACTION_READ`

#### `list_flag_actions`
- **Input:** `{ projectId: string, flagId: string, limit?: number }`
- **Output:** `AuditLog[]` (resourceType=FLAG, resourceId=flagId).
- **Permissions:** `AUDIT_READ`
- **Note:** "actions related to a flag" are interpreted as the **audit log**
  (flag change history). This is read-only.

### 4.2 Create/Update

#### `create_flag`
- **Input:** `{ projectId: string, key: string, description?: string }` (single; multiple via array — optional)
- **Output:** created `FeatureFlag` (with environments).
- **Permissions:** `FLAG_CREATE`
- **Service:** `FeatureFlagService.createFeatureFlag`

#### `update_flag`
- **Input:** `{ projectId: string, flagId: string, key?: string, description?: string }`
  (**`archived` is NOT allowed in MCP** — soft deletion via MCP is forbidden)
- **Output:** updated `FeatureFlag`.
- **Permissions:** `FLAG_UPDATE`
- **Service:** `FeatureFlagService.updateFeatureFlag` (DTO with `archived` always `undefined`)

#### `enable_flag` / `disable_flag`
- **Input:** `{ projectId, flagId, environmentId, enabled: boolean }`
- **Output:** `FeatureFlagEnvironment`.
- **Permissions:** `FLAG_TOGGLE`
- **Service:** `FeatureFlagService.configureFlagForEnvironment`
- (Can be merged into a single `toggle_flag` with `enabled` — preferred.)

#### `create_strategy`
- **Input:** `{ projectId, featureFlagEnvironmentIds: string[], name?, rolloutPercentage?, rolloutStickinessField?, segmentIds?, priority?, timezone?, startsAt?, endsAt?, isDefault?, rules?: [{field, operator, value, not}] }`
- **Output:** `Strategy[]` (one per env).
- **Permissions:** `FLAG_STRATEGY_CREATE`
- **Service:** `StrategyService.createStrategy`

#### `update_strategy`
- **Input:** `{ projectId, strategyId, ...fields (PartialType create) }`
- **Output:** `Strategy`.
- **Permissions:** `FLAG_STRATEGY_UPDATE`
- **Service:** `StrategyService.updateStrategy`
- **Note:** `rules[]` rewrites the rules (delete+create inside the service) —
  that is update semantics and is allowed. Deleting individual rules via
  `deleteStrategyRule` is **not registered** (use `update_strategy` without the
  rule being removed).

#### `toggle_strategy`
- **Input:** `{ projectId, strategyId, enabled: boolean }`
- **Output:** `Strategy`.
- **Permissions:** `FLAG_STRATEGY_TOGGLE`
- **Service:** `StrategyService.toggleStrategyEnable`

#### `create_variant`
- **Input:** `{ projectId, featureFlagId, name, colorTag, description?, payloadType?, payload? }`
- **Output:** `Variant`.
- **Permissions:** `VARIANT_CREATE`
- **Service:** `VariantService.createVariant`

#### `update_variant`
- **Input:** `{ projectId, variantId, name?, description?, payloadType?, payload?, colorTag? }`
- **Output:** `Variant`.
- **Permissions:** `VARIANT_UPDATE`
- **Service:** `VariantService.updateVariant`

#### `add_variant_to_strategy`
- **Input:** `{ projectId, strategyId, variantId? | name+colorTag+..., weight?, isCustomWeight? }`
- **Output:** `StrategyVariant`.
- **Permissions:** `FLAG_STRATEGY_UPDATE`
- **Service:** `StrategyService.addVariantToStrategy`

#### `update_strategy_variant`
- **Input:** `{ projectId, strategyId, variantId, weight?, isCustomWeight? }`
- **Output:** `StrategyVariant`.
- **Permissions:** `FLAG_STRATEGY_UPDATE`
- **Service:** `StrategyService.updateStrategyVariant`

#### `create_segment`
- **Input:** `{ projectId, key, name, description?, rules: [{segmentId, field, operator, value, not?}] }`
- **Output:** `Segment`.
- **Permissions:** `SEGMENT_CREATE`
- **Service:** `SegmentService.createSegment`

#### `update_segment`
- **Input:** `{ projectId, segmentId, key?, name?, description?, rules: [{id?, field, operator, value, not?}] }`
- **Output:** `Segment`.
- **Permissions:** `SEGMENT_UPDATE`
- **Service:** `SegmentService.updateSegment`

#### `create_action`
- **Input:** `{ projectId, key, description?, enabled?, defaultEffect?, strategies?: [{effect, priority?, enabled?, segmentIds?, matchType?, rules: [{field, operator, value, not?}]}] }`
- **Output:** `Action`.
- **Permissions:** `ACTION_CREATE`
- **Service:** `ActionService.createAction`

#### `update_action`
- **Input:** `{ projectId, actionId, key?, description?, enabled?, defaultEffect?, strategies?: [{id?, effect, ...}] }`
- **Output:** `Action`.
- **Permissions:** `ACTION_UPDATE`
- **Service:** `ActionService.updateAction`
