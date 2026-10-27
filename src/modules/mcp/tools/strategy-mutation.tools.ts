import { Injectable } from '@nestjs/common';
import { StrategyService } from '../../strategy/strategy.service';
import { McpPermissions } from '../mcp.permissions';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import type { McpToolDefinition } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';
import { projectIdSchema, strategyIdSchema } from './schemas';

/**
 * Mutation MCP tools for strategies (Task 5).
 *
 * Exposed:
 *  - `create_strategy`     — create a strategy on one or more flag environments
 *  - `update_strategy`    — update strategy fields (rollout, segments, rules, ...)
 *  - `toggle_strategy`    — enable/disable a strategy
 *
 * `update_strategy` covers `configure_rollout` (rolloutPercentage +
 * rolloutStickinessField) and `configure_targeting` (rules + segmentIds) from
 * the original task list — RolloutCtrl models both as strategy fields, so a
 * single update tool is the correct, non-duplicating surface.
 */
@Injectable()
export class StrategyMutationTools {
  constructor(
    private readonly strategies: StrategyService,
    private readonly perms: McpPermissions,
  ) {}

  /** `create_strategy` — create a strategy on flag environments. */
  createStrategy(): McpToolDefinition {
    return {
      name: 'create_strategy',
      description:
        'Create a strategy attached to one or more feature flag environments. Supports rollout percentage (with stickiness field), segments, rules, scheduling (startsAt/endsAt with timezone) and isDefault. `rolloutStickinessField` is required when `rolloutPercentage` is set.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          featureFlagEnvironmentIds: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Feature flag environment IDs to attach the strategy to',
          },
          name: { type: 'string', description: 'Strategy name' },
          rolloutPercentage: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Rollout percentage (0-100)',
          },
          rolloutStickinessField: {
            type: 'string',
            description:
              'Stickiness field (required when rolloutPercentage is set)',
          },
          segmentIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Segment IDs attached to this strategy',
          },
          priority: {
            type: 'number',
            minimum: 0,
            description: 'Strategy priority',
          },
          timezone: {
            type: 'string',
            description: 'Timezone (required with startsAt/endsAt)',
          },
          startsAt: { type: 'string', description: 'Start date (ISO 8601)' },
          endsAt: { type: 'string', description: 'End date (ISO 8601)' },
          isDefault: {
            type: 'boolean',
            description: 'Whether this is the default strategy',
          },
          rules: {
            type: 'array',
            description: 'Rules for this strategy',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                operator: {
                  type: 'string',
                  description: 'Comparison operator',
                },
                value: { type: 'string' },
                not: { type: 'boolean' },
                priority: { type: 'number', minimum: 0 },
              },
              required: ['field', 'operator', 'value', 'not'],
            },
          },
        },
        required: ['projectId', 'featureFlagEnvironmentIds'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_STRATEGY_CREATE);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.strategies.createStrategy(ctx.user, args);
      },
    };
  }

  /** `update_strategy` — update strategy fields (rollout, targeting, ...). */
  updateStrategy(): McpToolDefinition {
    return {
      name: 'update_strategy',
      description:
        'Update a strategy. Covers rollout configuration (rolloutPercentage + rolloutStickinessField) and targeting (rules, segmentIds). `rolloutStickinessField` is required when `rolloutPercentage` is set.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          strategyId: strategyIdSchema,
          featureFlagEnvironmentIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Feature flag environment IDs to move the strategy to',
          },
          name: { type: 'string', description: 'Strategy name' },
          rolloutPercentage: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Rollout percentage (0-100)',
          },
          rolloutStickinessField: {
            type: 'string',
            description:
              'Stickiness field (required when rolloutPercentage is set)',
          },
          segmentIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Segment IDs attached to this strategy',
          },
          priority: {
            type: 'number',
            minimum: 0,
            description: 'Strategy priority',
          },
          timezone: {
            type: 'string',
            description: 'Timezone (required with startsAt/endsAt)',
          },
          startsAt: { type: 'string', description: 'Start date (ISO 8601)' },
          endsAt: { type: 'string', description: 'End date (ISO 8601)' },
          isDefault: {
            type: 'boolean',
            description: 'Whether this is the default strategy',
          },
          rules: {
            type: 'array',
            description: 'Rules for this strategy',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                operator: {
                  type: 'string',
                  description: 'Comparison operator',
                },
                value: { type: 'string' },
                not: { type: 'boolean' },
                priority: { type: 'number', minimum: 0 },
              },
              required: ['field', 'operator', 'value', 'not'],
            },
          },
        },
        required: ['projectId', 'strategyId'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_STRATEGY_UPDATE);
        this.perms.requireProjectScope(ctx, args.projectId);
        const { strategyId, ...dto } = args;
        return this.strategies.updateStrategy(ctx.user, strategyId, dto);
      },
    };
  }

  /** `toggle_strategy` — enable/disable a strategy. */
  toggleStrategy(): McpToolDefinition {
    return {
      name: 'toggle_strategy',
      description:
        'Enable or disable a strategy. Returns the updated strategy.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          strategyId: strategyIdSchema,
          enabled: {
            type: 'boolean',
            description: 'Whether the strategy is enabled',
          },
        },
        required: ['projectId', 'strategyId', 'enabled'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_STRATEGY_TOGGLE);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.strategies.toggleStrategyEnable(
          args.strategyId,
          ctx.user,
          args.enabled,
          args.projectId,
        );
      },
    };
  }

  all(): McpToolDefinition[] {
    return [
      this.createStrategy(),
      this.updateStrategy(),
      this.toggleStrategy(),
    ];
  }
}
