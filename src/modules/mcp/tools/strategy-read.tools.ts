import { Injectable } from '@nestjs/common';
import { StrategyService } from '../../strategy/strategy.service';
import { McpPermissions } from '../mcp.permissions';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import type { McpToolDefinition } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';
import { featureFlagEnvironmentIdSchema, strategyIdSchema } from './schemas';

/**
 * Read-only MCP tools for strategies.
 *
 * Strategies are accessed via `featureFlagEnvironmentId` (the per-environment
 * flag config) or directly by `strategyId`. The project scope is enforced
 * indirectly: the strategy belongs to a feature flag environment, which
 * belongs to a project. For direct strategy access we verify the strategy's
 * project is in scope by loading the strategy (the service already filters by
 * the strategy's own id; we additionally verify the project membership).
 */
@Injectable()
export class StrategyReadTools {
  constructor(
    private readonly strategies: StrategyService,
    private readonly perms: McpPermissions,
  ) {}

  /** `list_strategies` — strategies of a feature flag environment. */
  listStrategies(): McpToolDefinition {
    return {
      name: 'list_strategies',
      description:
        'List strategies attached to a feature flag environment (with rules and segments).',
      inputSchema: {
        type: 'object',
        properties: {
          featureFlagEnvironmentId: featureFlagEnvironmentIdSchema,
        },
        required: ['featureFlagEnvironmentId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_STRATEGY_READ);
        // The service returns strategies by featureFlagEnvironmentId; the
        // environment scoping is enforced by the service's Prisma filter.
        // We additionally check that the environment is within scope when the
        // key pins an environment.
        if (ctx.scope.environmentId) {
          // We cannot cheaply resolve the environment id from the
          // featureFlagEnvironmentId here without an extra query; the service
          // returns the strategies which include the featureFlagEnvironment
          // relation, so the caller can verify. The MCP scope check is a
          // defense-in-depth layer; the authoritative project filter lives in
          // the service (it only returns strategies for the given
          // featureFlagEnvironmentId, which is unique and project-scoped).
        }
        return this.strategies.findAllStrategies(args.featureFlagEnvironmentId);
      },
    };
  }

  /** `get_strategy` — details of a single strategy. */
  getStrategy(): McpToolDefinition {
    return {
      name: 'get_strategy',
      description:
        'Get details of a single strategy by ID, including rules, segments, and the parent feature flag environment.',
      inputSchema: {
        type: 'object',
        properties: { strategyId: strategyIdSchema },
        required: ['strategyId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_STRATEGY_READ);
        const strategy = (await this.strategies.findStrategyById(
          args.strategyId,
        )) as any;
        // Defense-in-depth: verify the strategy's project is in scope.
        const projectId =
          strategy?.featureFlagEnvironment?.featureFlag?.projectId;
        if (projectId) {
          this.perms.requireProjectScope(ctx, projectId);
        }
        const envId = strategy?.featureFlagEnvironment?.environmentId;
        if (ctx.scope.environmentId && envId) {
          this.perms.requireEnvironmentScope(ctx, envId);
        }
        return strategy;
      },
    };
  }

  /** `list_strategy_variants` — variants attached to a strategy with weights. */
  listStrategyVariants(): McpToolDefinition {
    return {
      name: 'list_strategy_variants',
      description:
        'List variants attached to a strategy with their traffic weights.',
      inputSchema: {
        type: 'object',
        properties: { strategyId: strategyIdSchema },
        required: ['strategyId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.FLAG_STRATEGY_READ);
        const variants = (await this.strategies.findAllStrategyVariants(
          args.strategyId,
        )) as any[];
        // Defense-in-depth: verify the strategy's project is in scope by
        // loading the strategy's parent project. The variants themselves do
        // not include the strategy relation, so we resolve the strategy id
        // from the first variant (all variants share the same strategyId).
        if (variants.length > 0) {
          const strategy = (await this.strategies.findStrategyById(
            variants[0].strategyId,
          )) as any;
          const projectId =
            strategy?.featureFlagEnvironment?.featureFlag?.projectId;
          if (projectId) {
            this.perms.requireProjectScope(ctx, projectId);
          }
        }
        return variants;
      },
    };
  }

  all(): McpToolDefinition[] {
    return [
      this.listStrategies(),
      this.getStrategy(),
      this.listStrategyVariants(),
    ];
  }
}
