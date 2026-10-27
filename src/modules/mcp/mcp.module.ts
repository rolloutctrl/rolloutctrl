import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { McpController } from './mcp.controller';
import { McpAuthGuard } from './mcp-auth.guard';
import { McpServerFactory } from './tools/mcp-server.factory';
import { McpToolsModule } from './tools/mcp-tools.module';

/**
 * MCP module.
 *
 * Exposes the Streamable HTTP MCP endpoint at `/mcp`. Authentication is
 * performed by {@link McpAuthGuard} using an AGENT API key (`x-api-key`).
 * Authorization is enforced per-tool by {@link McpPermissions} against a fixed
 * capability allowlist.
 *
 * `ToolRegistry` and `McpPermissions` are provided/exported by
 * {@link McpToolsModule} (imported below) so they are available to
 * `McpServerFactory` and `McpController`. Read-only tools (Task 4) are
 * registered by `McpToolsModule` on bootstrap. Mutation tools (Task 5) will
 * be added in a follow-up module.
 */
@Module({
  imports: [PrismaModule, McpToolsModule],
  controllers: [McpController],
  providers: [McpAuthGuard, McpServerFactory],
})
export class McpModule {}
