import { Injectable } from '@nestjs/common';
import { FeatureFlagService } from '../../feature-flag/feature-flag.service';
import { McpPermissions } from '../mcp.permissions';
import { McpDryRunService } from '../mcp-dry-run';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import type { McpToolDefinition } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';
import { projectIdSchema, flagIdSchema, environmentIdSchema } from './schemas';

/**
 * Mutation MCP tools for feature flags (Task 5).
 *
 * Exposed:
 *  - `create_flag`        — create a single flag (key + description)
 *  - `update_flag`        — update key/description (NOT `archived` — prohibited)
 *  - `enable_flag`        — enable a flag in an environment
 *  - `disable_flag`       — disable a flag in an environment
 *
 * `archived` is intentionally NOT accepted by `update_flag` (architecture
 * decision: archiving is an administrative operation not exposed via MCP).
 */
@Injectable()
export class FlagMutationTools {
  constructor(
    private readonly flags: FeatureFlagService,
    private readonly perms: McpPermissions,
    private readonly dryRun: McpDryRunService,
  ) {}

  /** `create_flag` — create a single feature flag. */
  createFlag(): McpToolDefinition {
    return {
      name: 'create_flag',
      description:
        'Create a single feature flag in a project. The flag is disabled in all existing environments. `key` must be kebab-case or camelCase (2-100 chars).',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          key: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z]+(?:[A-Z][a-z0-9]*)*$',
            description: 'Feature flag key (kebab-case or camelCase)',
          },
          description: {
            type: 'string',
            maxLength: 500,
            description: 'Optional flag description',
          },
        },
        required: ['projectId', 'key'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_CREATE);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.flags.createFeatureFlag(ctx.user, args.projectId, {
          projectId: args.projectId,
          type: 'single' as any,
          key: args.key,
          description: args.description,
        });
      },
    };
  }

  /** `update_flag` — update key/description. `archived` is NOT accepted. */
  updateFlag(): McpToolDefinition {
    return {
      name: 'update_flag',
      description:
        'Update a feature flag key and/or description. `archived` is not exposed via MCP (use the management UI/API to archive).',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          flagId: flagIdSchema,
          key: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z]+(?:[A-Z][a-z0-9]*)*$',
            description: 'New flag key (kebab-case or camelCase)',
          },
          description: {
            type: 'string',
            maxLength: 500,
            description: 'New flag description',
          },
        },
        required: ['projectId', 'flagId'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_UPDATE);
        this.perms.requireProjectScope(ctx, args.projectId);
        // Explicitly strip `archived` — it is prohibited via MCP.
        const dto: any = { projectId: args.projectId };
        if (args.key !== undefined) dto.key = args.key;
        if (args.description !== undefined) dto.description = args.description;
        return this.flags.updateFeatureFlag(args.flagId, args.projectId, dto);
      },
    };
  }

  /** `enable_flag` — enable a flag in an environment. */
  enableFlag(): McpToolDefinition {
    return {
      name: 'enable_flag',
      description:
        'Enable a feature flag in a specific environment. Returns the updated per-environment flag configuration. For production environments, pass `dryRun: true` to preview the change without applying it.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          flagId: flagIdSchema,
          environmentId: environmentIdSchema,
          dryRun: {
            type: 'boolean',
            description:
              'When true, preview the change without applying it (recommended for production). Returns { wouldApply, enabled, isProduction } instead of mutating.',
          },
        },
        required: ['projectId', 'flagId', 'environmentId'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_TOGGLE);
        this.perms.requireProjectScope(ctx, args.projectId);
        if (ctx.scope.environmentId) {
          this.perms.requireEnvironmentScope(ctx, args.environmentId);
        }
        const isProduction = await this.dryRun.isProductionEnvironment(
          args.environmentId,
        );
        if (args.dryRun) {
          return {
            wouldApply: true,
            enabled: true,
            isProduction,
            message: isProduction
              ? 'Preview: flag would be ENABLED in production. Re-run with dryRun: false (or omit it) to apply.'
              : 'Preview: flag would be enabled. Re-run with dryRun: false (or omit it) to apply.',
          };
        }
        return this.flags.configureFlagForEnvironment(ctx.user, {
          projectId: args.projectId,
          flagId: args.flagId,
          environmentId: args.environmentId,
          enabled: true,
        });
      },
    };
  }

  /** `disable_flag` — disable a flag in an environment. */
  disableFlag(): McpToolDefinition {
    return {
      name: 'disable_flag',
      description:
        'Disable a feature flag in a specific environment. Returns the updated per-environment flag configuration. For production environments, pass `dryRun: true` to preview the change without applying it.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          flagId: flagIdSchema,
          environmentId: environmentIdSchema,
          dryRun: {
            type: 'boolean',
            description:
              'When true, preview the change without applying it (recommended for production). Returns { wouldApply, enabled, isProduction } instead of mutating.',
          },
        },
        required: ['projectId', 'flagId', 'environmentId'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_TOGGLE);
        this.perms.requireProjectScope(ctx, args.projectId);
        if (ctx.scope.environmentId) {
          this.perms.requireEnvironmentScope(ctx, args.environmentId);
        }
        const isProduction = await this.dryRun.isProductionEnvironment(
          args.environmentId,
        );
        if (args.dryRun) {
          return {
            wouldApply: true,
            enabled: false,
            isProduction,
            message: isProduction
              ? 'Preview: flag would be DISABLED in production. Re-run with dryRun: false (or omit it) to apply.'
              : 'Preview: flag would be disabled. Re-run with dryRun: false (or omit it) to apply.',
          };
        }
        return this.flags.configureFlagForEnvironment(ctx.user, {
          projectId: args.projectId,
          flagId: args.flagId,
          environmentId: args.environmentId,
          enabled: false,
        });
      },
    };
  }

  all(): McpToolDefinition[] {
    return [
      this.createFlag(),
      this.updateFlag(),
      this.enableFlag(),
      this.disableFlag(),
    ];
  }
}
