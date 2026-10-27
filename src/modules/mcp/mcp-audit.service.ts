import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, ResourceType } from 'src/common/generated/prisma/client';

/**
 * Audit envelope for a single MCP tool invocation.
 */
export interface McpAuditEntry {
  /** Tool name (e.g. `create_flag`, `enable_flag`). */
  tool: string;
  /**
   * Audit action classifying the call: `READ` for read-only tools,
   * `CREATE`/`ENABLE`/`DISABLE`/`UPDATE` for mutations (resolved by the
   * registry from the tool's `readOnlyHint` annotation and name).
   */
  action: AuditAction;
  /** Agent user id (audit actor). */
  userId: string;
  /** Project the tool targeted (first in-scope project from args, if any). */
  projectId?: string;
  /** Organization id resolved from the project (best-effort). */
  organizationId?: string;
  /** `true` if the handler succeeded, `false` if it threw. */
  success: boolean;
  /** Error message when `success` is false. */
  error?: string;
  /** Wall-clock duration of the handler call in ms. */
  durationMs: number;
  /** ISO timestamp of the call. */
  timestamp: string;
}

/**
 * MCP-level audit logger.
 *
 * Writes a single {@link AuditLog} row per tool invocation, capturing the
 * MCP-specific envelope (tool name, scope, success/failure, duration). This
 * is separate from the business-level audit that the domain services write
 * (e.g. `FeatureFlagService.createFeatureFlag` logs `AuditAction.CREATE` for
 * the flag). The MCP audit row carries the per-tool action resolved by the
 * registry (`READ`/`CREATE`/`UPDATE`) and stores the MCP envelope in
 * `metadata.mcp`.
 *
 * Secrets are never logged: the audit payload is built from the tool name,
 * scope, and result status only — never from tool arguments or service
 * responses, which may contain payloads, keys, or internal data.
 */
@Injectable()
export class McpAuditService {
  private readonly logger = new Logger(McpAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record an MCP tool invocation. Best-effort: audit failures are logged but
   * never propagated to the caller (a failed audit must not break the tool
   * response).
   */
  async record(entry: McpAuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          organizationId: entry.organizationId ?? 'unknown',
          projectId: entry.projectId ?? null,
          userId: entry.userId,
          action: entry.action,
          resourceType: ResourceType.PROJECT,
          resourceId: entry.projectId ?? entry.tool,
          resourceName: entry.tool,
          metadata: {
            mcp: {
              tool: entry.tool,
              success: entry.success,
              ...(entry.error ? { error: entry.error } : {}),
              durationMs: entry.durationMs,
              timestamp: entry.timestamp,
            },
          },
        },
      });
    } catch (err) {
      // Audit is best-effort; never let it break the tool response.
      this.logger.warn(
        `Failed to record MCP audit for tool "${entry.tool}": ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  /**
   * Resolve the organization id for a project (best-effort, for audit).
   * Returns undefined if the project cannot be found.
   */
  async resolveOrganizationId(projectId: string): Promise<string | undefined> {
    try {
      const project = await this.prisma.project.findFirst({
        where: { OR: [{ id: projectId }, { slug: projectId }] },
        select: { organizationId: true },
      });
      return project?.organizationId ?? undefined;
    } catch {
      return undefined;
    }
  }
}
