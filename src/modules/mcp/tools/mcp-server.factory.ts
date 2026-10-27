import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/server';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';
import { MCP_SERVER_INFO } from '../mcp.constants';
import { ToolRegistry } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';

/**
 * Factory that builds a fresh, per-request MCP server wired with the
 * Streamable HTTP transport in stateless mode.
 *
 * Stateless mode (no session id) is used because:
 *  - The NestJS app is horizontally scalable; in-memory session state would
 *    not survive a load balancer rerouting.
 *  - Each request carries its own JWT, so per-request auth context is the
 *    natural unit of work.
 *
 * The returned tuple owns the `McpServer` and `Transport`; the controller must
 * `await server.close()` after `transport.handleRequest` resolves so the
 * transport's resources are released.
 */
export interface McpServerHandle {
  server: McpServer;
  transport: NodeStreamableHTTPServerTransport;
}

@Injectable()
export class McpServerFactory {
  constructor(private readonly toolRegistry: ToolRegistry) {}

  /**
   * Create a per-request MCP server with all allowlisted tools bound to the
   * given request context (authenticated user).
   */
  async create(ctx: McpRequestContext): Promise<McpServerHandle> {
    const server = new McpServer(MCP_SERVER_INFO, {
      // Stateless servers do not advertise session support.
      // Capabilities default to advertising `tools` once tools are registered.
    });

    const transport = new NodeStreamableHTTPServerTransport({
      // undefined sessionIdGenerator => stateless mode (no session id).
      sessionIdGenerator: undefined,
    });

    // Register all allowlisted tools with the per-request user bound into
    // each handler closure.
    this.toolRegistry.attachTo(server, ctx);

    // Connect transport to the server. This wires the JSON-RPC request
    // handlers (initialize, tools/list, tools/call) onto the transport.
    await server.connect(transport);

    return { server, transport };
  }
}
