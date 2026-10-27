import { Injectable, Logger } from '@nestjs/common';
import { McpServer, fromJsonSchema } from '@modelcontextprotocol/server';
import { AuditAction } from 'src/common/generated/prisma/client';
import type { McpRequestContext } from '../mcp.types';
import { McpAuditService } from '../mcp-audit.service';

/**
 * A tool definition in the MCP allowlist.
 *
 * `handler` receives the parsed tool arguments (already validated against
 * `inputSchema`) and the per-request `McpRequestContext` (authenticated user).
 * It returns either a plain data object (wrapped into a structured MCP result
 * by the registry) or throws `McpToolError` for a controlled error response.
 */
export interface McpToolDefinition<
  TArgs = Record<string, unknown>,
  TResult = unknown,
> {
  /** Unique tool name (snake_case, used by MCP clients). */
  name: string;
  /** Human-readable description shown to the LLM. */
  description: string;
  /** JSON Schema (draft 07) describing the tool's input arguments. */
  inputSchema: Record<string, unknown>;
  /**
   * Optional JSON Schema describing the structured output. When omitted the
   * output schema is left unconstrained.
   */
  outputSchema?: Record<string, unknown>;
  /**
   * Optional MCP tool annotations (e.g. `readOnlyHint`, `destructiveHint`).
   * Read-only tools SHOULD set `readOnlyHint: true` and `destructiveHint: false`.
   */
  annotations?: Record<string, unknown>;
  /** Handler invoked on each tool call. */
  handler: (args: TArgs, ctx: McpRequestContext) => Promise<TResult>;
}

/**
 * Central allowlist of MCP tools.
 *
 * Only tools registered here are exposed to MCP clients. This is the
 * architectural enforcement point for the operation allowlist/matrix: deleting
 * and administrative operations are simply never registered, so they cannot be
 * invoked through MCP regardless of client input.
 */
@Injectable()
export class ToolRegistry {
  private readonly logger = new Logger(ToolRegistry.name);
  private readonly tools = new Map<string, McpToolDefinition>();

  constructor(private readonly audit: McpAuditService) {}

  /**
   * Register a tool in the allowlist. Throws if a tool with the same name is
   * already registered (catches accidental duplicates at boot).
   */
  register<TArgs, TResult>(tool: McpToolDefinition<TArgs, TResult>): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`MCP tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool as unknown as McpToolDefinition);
    this.logger.log(`Registered MCP tool: ${tool.name}`);
  }

  /**
   * Attach every registered tool to a freshly created `McpServer` instance,
   * binding the per-request `ctx` into each handler closure.
   *
   * Called once per HTTP request (stateless mode) so handlers always see the
   * authenticated user for that request.
   *
   * Each handler invocation is wrapped in an MCP audit record (tool name,
   * scope, success/failure, duration). The audit payload never contains tool
   * arguments or service responses, so secrets cannot leak into the audit log.
   */
  attachTo(server: McpServer, ctx: McpRequestContext): void {
    for (const tool of this.tools.values()) {
      server.registerTool(
        tool.name,
        {
          description: tool.description,
          inputSchema: fromJsonSchema(tool.inputSchema as any),
          ...(tool.outputSchema
            ? { outputSchema: fromJsonSchema(tool.outputSchema as any) }
            : {}),
          ...(tool.annotations ? { annotations: tool.annotations as any } : {}),
        },
        async (args: unknown) => {
          const startedAt = Date.now();
          const timestamp = new Date().toISOString();
          let success = false;
          let errorMessage: string | undefined;
          try {
            const result = await tool.handler(args as any, ctx);
            success = true;
            const text = JSON.stringify(result, null, 2);
            return {
              content: [{ type: 'text' as const, text }],
              structuredContent: result as any,
              isError: false,
            };
          } catch (error) {
            errorMessage =
              error instanceof Error ? error.message : 'Tool execution failed';
            this.logger.warn(
              `Tool "${tool.name}" failed: ${errorMessage}`,
              error instanceof Error ? error.stack : undefined,
            );
            return {
              content: [{ type: 'text' as const, text: errorMessage }],
              isError: true,
            };
          } finally {
            // Record MCP audit (best-effort, never throws). The project is
            // taken from the API key scope (an AGENT key is bound to exactly
            // one project), NOT from tool args — args.projectId may carry the
            // project slug, which would violate the AuditLog FK.
            const durationMs = Date.now() - startedAt;
            const action = this.resolveAuditAction(tool);
            const projectId = ctx.scope.projectId;
            const organizationId = await this.audit
              .resolveOrganizationId(projectId)
              .catch(() => undefined);
            this.audit
              .record({
                tool: tool.name,
                action,
                userId: ctx.user.id,
                projectId,
                organizationId,
                success,
                ...(errorMessage ? { error: errorMessage } : {}),
                durationMs,
                timestamp,
              })
              .catch(() => {
                // Swallow audit errors — already logged inside record().
              });
          }
        },
      );
    }
  }

  /**
   * Classify a tool call for the audit log: read-only tools are audited as
   * `READ`, `create_*`/`enable_*`/`disable_*` mutations as
   * `CREATE`/`ENABLE`/`DISABLE`, all other mutations as `UPDATE`.
   */
  private resolveAuditAction(tool: McpToolDefinition): AuditAction {
    if (tool.annotations?.['readOnlyHint'] === true) return AuditAction.READ;
    if (tool.name.startsWith('create_')) return AuditAction.CREATE;
    if (tool.name.startsWith('enable_')) return AuditAction.ENABLE;
    if (tool.name.startsWith('disable_')) return AuditAction.DISABLE;
    return AuditAction.UPDATE;
  }

  /** Number of registered tools (useful for diagnostics/tests). */
  get size(): number {
    return this.tools.size;
  }

  /** List registered tool names (for diagnostics/tests). */
  get names(): string[] {
    return [...this.tools.keys()];
  }
}
