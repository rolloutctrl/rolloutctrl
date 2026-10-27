import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Dry-run / preview support for high-risk MCP operations.
 *
 * For operations that affect production, the agent may pass `dryRun: true` to
 * preview the change without applying it. The handler returns a preview of
 * what would change and a `wouldApply` flag, but does NOT call the mutating
 * service.
 *
 * This is a defense-in-depth layer on top of the existing permission/scope
 * checks: the agent cannot bypass server-side validation by omitting
 * `dryRun` — the actual mutation still goes through the full service
 * validation pipeline.
 *
 * Production is identified by the environment's `name` being `production`
 * (case-insensitive), matching the existing notification logic in
 * `FeatureFlagService.configureFlagForEnvironment`.
 */
@Injectable()
export class McpDryRunService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns true if the given environment id is a production environment
   * (name === 'production', case-insensitive).
   */
  async isProductionEnvironment(environmentId: string): Promise<boolean> {
    const env = await this.prisma.environment.findUnique({
      where: { id: environmentId },
      select: { name: true },
    });
    return env?.name?.toLowerCase() === 'production';
  }
}
