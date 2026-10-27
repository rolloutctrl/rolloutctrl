import { Injectable } from '@nestjs/common';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import type { McpRequestContext } from './mcp.types';
import { McpToolError } from './mcp.types';

/**
 * Fixed capability set granted to an AGENT API key.
 *
 * Per the architecture decision, AGENT keys do NOT inherit the team role of
 * the creating user. Instead they get a fixed, conservative allowlist: read
 * access to flag/strategy/variant/segment/action/environment/audit, plus
 * limited create/update on flags, strategies, variants, segments and actions.
 * Delete and toggle of environment/project/org/user/api-key management are
 * NOT granted and the corresponding tools are not registered.
 */
export const AGENT_PERMISSIONS: ReadonlySet<PermissionCode> =
  new Set<PermissionCode>([
    // Read
    PermissionCode.PROJECT_READ,
    PermissionCode.ENV_READ,
    PermissionCode.FLAG_READ,
    PermissionCode.FLAG_STRATEGY_READ,
    PermissionCode.VARIANT_READ,
    PermissionCode.SEGMENT_READ,
    PermissionCode.ACTION_READ,
    PermissionCode.AUDIT_READ,
    // Create / Update
    PermissionCode.FLAG_CREATE,
    PermissionCode.FLAG_UPDATE,
    PermissionCode.FLAG_TOGGLE,
    PermissionCode.FLAG_STRATEGY_CREATE,
    PermissionCode.FLAG_STRATEGY_UPDATE,
    PermissionCode.FLAG_STRATEGY_TOGGLE,
    PermissionCode.VARIANT_CREATE,
    PermissionCode.VARIANT_UPDATE,
    PermissionCode.SEGMENT_CREATE,
    PermissionCode.SEGMENT_UPDATE,
    PermissionCode.ACTION_CREATE,
    PermissionCode.ACTION_UPDATE,
  ]);

/**
 * Verifies the AGENT API key has a given permission in its fixed allowlist.
 *
 * This is the MCP authorization boundary: every tool handler calls
 * `requirePermission(ctx, code)` before invoking the underlying service.
 * The check is independent of client-supplied parameters and cannot be
 * bypassed — if the permission is not in {@link AGENT_PERMISSIONS}, the call
 * is rejected with a `McpToolError` (forbidden).
 */
@Injectable()
export class McpPermissions {
  /**
   * Assert the current MCP client (agent user) has `permission`.
   * Throws `McpToolError` (kind: 'forbidden') if not.
   */
  requirePermission(ctx: McpRequestContext, permission: PermissionCode): void {
    if (!AGENT_PERMISSIONS.has(permission)) {
      throw new McpToolError(
        `MCP client is not permitted to perform this operation`,
        'forbidden',
      );
    }
  }

  /**
   * Assert a tool-supplied `projectId` (id or slug) is within the API key
   * scope. Throws `McpToolError` (kind: 'forbidden') if not. This prevents an
   * agent from referencing another project's entities by ID substitution.
   */
  requireProjectScope(ctx: McpRequestContext, projectId: string): void {
    if (
      projectId !== ctx.scope.projectId &&
      projectId !== ctx.scope.projectSlug
    ) {
      throw new McpToolError(
        `Project is outside the MCP client scope`,
        'forbidden',
      );
    }
  }

  /**
   * Assert a tool-supplied `environmentId` is within scope. When the API key
   * pins an environment, only that environment is allowed; otherwise any
   * environment of the project is allowed (the service layer still verifies
   * the environment belongs to the project).
   */
  requireEnvironmentScope(ctx: McpRequestContext, environmentId: string): void {
    if (ctx.scope.environmentId && environmentId !== ctx.scope.environmentId) {
      throw new McpToolError(
        `Environment is outside the MCP client scope`,
        'forbidden',
      );
    }
  }
}
