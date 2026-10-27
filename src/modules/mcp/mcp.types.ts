import type { User } from 'src/common/generated/prisma/client';

/**
 * Scope of an authenticated MCP client, derived from the AGENT API key.
 * Every tool call must target entities within this scope.
 */
export interface McpClientScope {
  /**
   * The project the API key is scoped to. Tool calls may only target this
   * project. An AGENT key belongs to exactly one project (the project it was
   * created in).
   */
  projectId: string;
  /**
   * Slug of the scoped project (when resolvable). Domain services accept
   * either an id or a slug, so both are admitted by the scope check.
   */
  projectSlug: string | null;
  /**
   * Optional environment restriction. When set, tool calls that target a
   * specific environment may only target this one. When null, all
   * environments of the scoped project are accessible (subject to
   * permissions).
   */
  environmentId: string | null;
}

/**
 * Per-request MCP context propagated from the authenticated HTTP request
 * into tool handlers. Tool handlers receive this as their second argument
 * (after the parsed tool arguments) via the ToolRegistry.
 */
export interface McpRequestContext {
  /**
   * Authenticated agent user (loaded by McpAuthGuard from the AGENT API
   * key's linked user). Used as the `currentUser` argument to services and
   * as the audit actor.
   */
  user: User;
  /**
   * Project/environment scope from the AGENT API key. Tool handlers MUST
   * verify that every referenced entity belongs to this scope before
   * calling services.
   */
  scope: McpClientScope;
}

/**
 * Result returned by a tool handler. The registry wraps this into the MCP
 * `CallToolResult` shape (`content` + optional `structuredContent`).
 *
 * `data` is serialized to JSON and returned as `structuredContent` plus a
 * `text` content block for clients that don't support structured content.
 */
export interface McpToolResult<T = unknown> {
  data: T;
}

/**
 * Error thrown by tool handlers when the caller lacks permissions or tries
 * to access a resource outside their scope. The registry converts it into an
 * MCP error result with a stable, non-leaky message.
 */
export class McpToolError extends Error {
  constructor(
    message: string,
    public readonly kind:
      'forbidden' | 'not-found' | 'bad-request' | 'conflict' = 'bad-request',
  ) {
    super(message);
    this.name = 'McpToolError';
  }
}
