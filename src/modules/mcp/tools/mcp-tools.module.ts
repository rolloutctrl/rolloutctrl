import { Module } from '@nestjs/common';
import { FeatureFlagModule } from '../../feature-flag/feature-flag.module';
import { EnvironmentModule } from '../../environment/environment.module';
import { StrategyModule } from '../../strategy/strategy.module';
import { VariantModule } from '../../variant/variant.module';
import { SegmentModule } from '../../segment/segment.module';
import { ActionModule } from '../../action/action.module';
import { AuditLogModule } from '../../audit-log/audit-log.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { McpPermissions } from '../mcp.permissions';
import { McpAuditService } from '../mcp-audit.service';
import { McpDryRunService } from '../mcp-dry-run';
import { ToolRegistry } from './tool.registry';
import { FlagReadTools } from './flag-read.tools';
import { EnvironmentReadTools } from './environment-read.tools';
import { StrategyReadTools } from './strategy-read.tools';
import { VariantReadTools } from './variant-read.tools';
import { SegmentReadTools } from './segment-read.tools';
import { ActionReadTools } from './action-read.tools';
import { AuditReadTools } from './audit-read.tools';
import { FlagMutationTools } from './flag-mutation.tools';
import { StrategyMutationTools } from './strategy-mutation.tools';
import { VariantMutationTools } from './variant-mutation.tools';
import { SegmentMutationTools } from './segment-mutation.tools';
import { ActionMutationTools } from './action-mutation.tools';

/**
 * Aggregates all MCP tools (read-only Task 4 + mutation Task 5) and registers
 * them into the central {@link ToolRegistry} on application bootstrap.
 *
 * `ToolRegistry` and `McpPermissions` are provided and exported here so that
 * `McpModule` (which imports this module) can inject them into
 * `McpServerFactory` and `McpController`.
 *
 * Domain service modules are imported here so the tool handlers can inject
 * the existing services. No business logic is duplicated — every handler
 * delegates to the service after enforcing the MCP permission + scope checks.
 */
@Module({
  imports: [
    PrismaModule,
    FeatureFlagModule,
    EnvironmentModule,
    StrategyModule,
    VariantModule,
    SegmentModule,
    ActionModule,
    AuditLogModule,
  ],
  providers: [
    ToolRegistry,
    McpPermissions,
    McpAuditService,
    McpDryRunService,
    FlagReadTools,
    EnvironmentReadTools,
    StrategyReadTools,
    VariantReadTools,
    SegmentReadTools,
    ActionReadTools,
    AuditReadTools,
    FlagMutationTools,
    StrategyMutationTools,
    VariantMutationTools,
    SegmentMutationTools,
    ActionMutationTools,
  ],
  exports: [ToolRegistry, McpPermissions],
})
export class McpToolsModule {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly flags: FlagReadTools,
    private readonly environments: EnvironmentReadTools,
    private readonly strategies: StrategyReadTools,
    private readonly variants: VariantReadTools,
    private readonly segments: SegmentReadTools,
    private readonly actions: ActionReadTools,
    private readonly audit: AuditReadTools,
    private readonly flagMutation: FlagMutationTools,
    private readonly strategyMutation: StrategyMutationTools,
    private readonly variantMutation: VariantMutationTools,
    private readonly segmentMutation: SegmentMutationTools,
    private readonly actionMutation: ActionMutationTools,
  ) {}

  /**
   * Register all tools into the allowlist. Called once on bootstrap
   * (via `OnModuleInit`).
   */
  onModuleInit() {
    for (const tool of [
      ...this.flags.all(),
      ...this.environments.all(),
      ...this.strategies.all(),
      ...this.variants.all(),
      ...this.segments.all(),
      ...this.actions.all(),
      ...this.audit.all(),
      ...this.flagMutation.all(),
      ...this.strategyMutation.all(),
      ...this.variantMutation.all(),
      ...this.segmentMutation.all(),
      ...this.actionMutation.all(),
    ]) {
      this.registry.register(tool);
    }
  }
}
