/**
 * Shared JSON Schema fragments for MCP tool input schemas.
 *
 * These are plain JSON Schema (draft 07) objects — the MCP SDK accepts them
 * via `fromJsonSchema()` and validates tool arguments against them.
 */

/** `projectId` argument: required string, must be within the API key scope. */
export const projectIdSchema = {
  type: 'string',
  description: 'Project ID (must be within the MCP client scope)',
} as const;

/** `flagId` argument: required string (accepts id or key). */
export const flagIdSchema = {
  type: 'string',
  description: 'Feature flag ID or key',
} as const;

/** `environmentId` argument: required string. */
export const environmentIdSchema = {
  type: 'string',
  description: 'Environment ID',
} as const;

/** `strategyId` argument: required string. */
export const strategyIdSchema = {
  type: 'string',
  description: 'Strategy ID',
} as const;

/** `variantId` argument: required string. */
export const variantIdSchema = {
  type: 'string',
  description: 'Variant ID',
} as const;

/** `segmentId` argument: required string. */
export const segmentIdSchema = {
  type: 'string',
  description: 'Segment ID',
} as const;

/** `actionId` argument: required string (accepts id or key). */
export const actionIdSchema = {
  type: 'string',
  description: 'Action ID or key',
} as const;

/** `featureFlagEnvironmentId` argument: required string. */
export const featureFlagEnvironmentIdSchema = {
  type: 'string',
  description: 'Feature flag environment ID (the per-environment flag config)',
} as const;

/** Optional cursor for pagination. */
export const cursorSchema = {
  type: 'string',
  description: 'Pagination cursor (from `nextCursor` of a previous call)',
} as const;

/** Optional limit for pagination (1-100, default 20). */
export const limitSchema = {
  type: 'number',
  minimum: 1,
  maximum: 100,
  description: 'Maximum number of items to return (default 20)',
} as const;

/** Optional includeArchived flag. */
export const includeArchivedSchema = {
  type: 'boolean',
  description: 'Include archived flags (default false)',
} as const;
