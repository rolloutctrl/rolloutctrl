import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { McpPermissions } from '../mcp.permissions';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { ResourceType } from 'src/common/generated/prisma/client';
import type { McpToolDefinition } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';
import { projectIdSchema, flagIdSchema, limitSchema } from './schemas';

/**
 * Read-only MCP tool for flag audit history.
 *
 * `list_flag_actions` returns the audit log entries for a feature flag
 * (resourceType = FLAG). This gives the agent visibility into the history of
 * changes for a flag without exposing unrelated audit data.
 */
@Injectable()
export class AuditReadTools {
  constructor(
    private readonly audit: AuditLogService,
    private readonly prisma: PrismaService,
    private readonly perms: McpPermissions,
  ) {}

  /** `list_flag_actions` — audit history for a flag. */
  listFlagActions(): McpToolDefinition {
    return {
      name: 'list_flag_actions',
      description:
        'List the audit history (create/update/toggle/...) for a feature flag. Returns recent audit log entries scoped to the flag.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          flagId: flagIdSchema,
          limit: limitSchema,
        },
        required: ['projectId', 'flagId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.AUDIT_READ);
        this.perms.requireProjectScope(ctx, args.projectId);

        // Resolve flagId (id or key) to a concrete flag id within the project,
        // so we query audit logs by the canonical resource id and verify the
        // flag belongs to the in-scope project.
        const flag = await this.prisma.featureFlag.findFirst({
          where: {
            OR: [{ id: args.flagId }, { key: args.flagId }],
            projectId: args.projectId,
          },
          select: { id: true },
        });
        if (!flag) {
          return { data: [], nextCursor: null, hasMore: false };
        }

        const limit = args.limit ?? 20;
        const logs = await this.audit.findByResource(
          ResourceType.FLAG,
          flag.id,
          args.projectId,
        );
        // Apply a soft limit on the in-memory result (findByResource does not
        // paginate; it returns up to its internal default).
        const data = logs.slice(0, limit);
        return {
          data,
          nextCursor: null,
          hasMore: logs.length > limit,
        };
      },
    };
  }

  all(): McpToolDefinition[] {
    return [this.listFlagActions()];
  }
}
