import {
  All,
  Controller,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpAuthGuard } from './mcp-auth.guard';
import { McpServerFactory } from './tools/mcp-server.factory';
import type { McpRequestContext } from './mcp.types';
import { MCP_ENDPOINT_PATH } from './mcp.constants';

/**
 * MCP Streamable HTTP endpoint.
 *
 * Mounted at `/mcp`.
 * Accepts POST requests carrying a JSON-RPC envelope (initialize, tools/list,
 * tools/call). GET/DELETE are accepted by the spec for SSE streaming and
 * session termination; in stateless mode they are answered by the transport.
 *
 * Authentication: AGENT API key via `x-api-key` header (validated by
 * {@link McpAuthGuard}). The guard attaches the agent `User` (audit actor) and
 * the API key scope (`projectId`, optional `environmentId`) to the request.
 *
 * A fresh `McpServer` + `NodeStreamableHTTPServerTransport` is created per
 * request (stateless mode) and closed after the request is handled, releasing
 * transport resources.
 */
@Controller(MCP_ENDPOINT_PATH)
@UseGuards(McpAuthGuard)
export class McpController {
  constructor(private readonly serverFactory: McpServerFactory) {}

  @All()
  @HttpCode(HttpStatus.OK)
  async handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    const user = (req as any).user?.user;
    const mcpApiKey = (req as any).mcpApiKey;
    if (!user || !mcpApiKey) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Unauthorized' });
      return;
    }

    const ctx: McpRequestContext = {
      user,
      scope: {
        projectId: mcpApiKey.projectId,
        projectSlug: mcpApiKey.projectSlug ?? null,
        environmentId: mcpApiKey.environmentId,
      },
      apiKeyPreview: mcpApiKey.apiKeyPreview,
    };

    const handle = await this.serverFactory.create(ctx);

    try {
      // Express parses JSON bodies via the global body parser (10mb limit in
      // main.ts). Pass the already-parsed body so the transport does not try
      // to re-read the consumed Node stream.
      await handle.transport.handleRequest(
        req as any,
        res as any,
        (req as any).body,
      );
    } catch {
      // The transport may throw on a malformed request or internal error.
      // Respond with a stable 500 if the response has not been started yet;
      // otherwise the transport has already answered and we just release.
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'MCP request failed',
        });
      }
    } finally {
      // Release transport/server resources for this request.
      await handle.server.close().catch(() => {
        // close() may throw if the transport already errored; ignore.
      });
    }
  }
}
