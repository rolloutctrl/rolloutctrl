import { Injectable } from '@nestjs/common';
import { FeatureFlagService } from '../../feature-flag/feature-flag.service';
import { McpPermissions } from '../mcp.permissions';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import type { McpToolDefinition } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';
import {
  projectIdSchema,
  flagIdSchema,
  environmentIdSchema,
  cursorSchema,
  limitSchema,
  includeArchivedSchema,
} from './schemas';

/**
 * Read-only MCP tools for feature flags.
 *
 * Each handler:
 *  1. Checks the AGENT permission via {@link McpPermissions}.
 *  2. Enforces the API key project scope (`requireProjectScope`).
 *  3. Delegates to {@link FeatureFlagService} (no Prisma writes).
 *  4. Returns the service result as structured content.
 */
@Injectable()
export class FlagReadTools {
  constructor(
    private readonly flags: FeatureFlagService,
    private readonly perms: McpPermissions,
  ) {}

  /** `list_flags` — paginated list of feature flags in a project. */
  listFlags(): McpToolDefinition {
    return {
      name: 'list_flags',
      description:
        'List feature flags in a project. Returns paginated flags with per-environment enabled state and strategies.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          includeArchived: includeArchivedSchema,
          cursor: cursorSchema,
          limit: limitSchema,
        },
        required: ['projectId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_READ);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.flags.findAllFeatureFlags(
          args.projectId,
          args.includeArchived ?? false,
          args.cursor,
          args.limit ?? 20,
        );
      },
    };
  }

  /** `get_flag` — detailed flag info (environments, strategies, variants). */
  getFlag(): McpToolDefinition {
    return {
      name: 'get_flag',
      description:
        'Get detailed information about a single feature flag, including per-environment configuration, strategies and variants. `flagId` accepts either the flag ID or its key.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          flagId: flagIdSchema,
        },
        required: ['projectId', 'flagId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_READ);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.flags.findFeatureFlagById(args.flagId, args.projectId);
      },
    };
  }

  /** `get_flag_config` — flag configuration in a specific environment. */
  getFlagConfig(): McpToolDefinition {
    return {
      name: 'get_flag_config',
      description:
        'Get the configuration of a feature flag in a specific environment: enabled state, strategies (with rules and segments).',
      inputSchema: {
        type: 'object',
        properties: {
          flagId: flagIdSchema,
          environmentId: environmentIdSchema,
        },
        required: ['flagId', 'environmentId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_READ);
        if (ctx.scope.environmentId) {
          this.perms.requireEnvironmentScope(ctx, args.environmentId);
        }
        return this.flags.getFlagEnvironmentConfig(
          args.flagId,
          args.environmentId,
        );
      },
    };
  }

  /** `get_flag_all_configs` — flag configuration across all environments. */
  getFlagAllConfigs(): McpToolDefinition {
    return {
      name: 'get_flag_all_configs',
      description:
        'Get the configuration of a feature flag across all environments of its project.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          flagId: flagIdSchema,
        },
        required: ['projectId', 'flagId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_READ);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.flags.getAllEnvironmentsConfig(args.flagId, args.projectId);
      },
    };
  }

  /** All flag read tools, for registration. */
  all(): McpToolDefinition[] {
    return [
      this.listFlags(),
      this.getFlag(),
      this.getFlagConfig(),
      this.getFlagAllConfigs(),
    ];
  }
}
