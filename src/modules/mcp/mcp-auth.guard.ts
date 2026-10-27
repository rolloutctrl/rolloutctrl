import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ApiKeyType } from 'src/common/generated/prisma/client';

/**
 * Authenticates an MCP client using an AGENT API key.
 *
 * The key is supplied in the `x-api-key` header (same convention as the SDK
 * guards). The guard:
 *  1. Hashes the key (sha256) and looks up a non-revoked `ApiKey` of type
 *     `AGENT`. Other key types (CLIENT/SERVER) are rejected.
 *  2. Loads the agent `User` linked to the key (`ApiKey.userId`) — this user
 *     acts as the audit actor for MCP operations.
 *  3. Attaches both the API key record and the user to the request:
 *       - `req.mcpApiKey`  — the API key record (projectId, environmentId, ...)
 *       - `req.user.user`  — the agent user (so `CurrentUser` decorator and
 *         existing services that take `currentUser: User` work unchanged).
 *
 * The MCP endpoint is project-scoped: every tool call must target the key's
 * `projectId` (enforced by the tool layer). When the key has an
 * `environmentId`, tool calls are additionally restricted to that environment.
 */
@Injectable()
export class McpAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey: string | undefined = request.headers['x-api-key'];

    if (!apiKey || apiKey.trim().length === 0) {
      throw new UnauthorizedException('Missing API key');
    }

    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const apiKeyRecord = await this.prisma.apiKey.findFirst({
      where: { keyHash, revokedAt: null, type: ApiKeyType.AGENT },
      select: {
        id: true,
        projectId: true,
        environmentId: true,
        userId: true,
        previewKey: true,
        project: { select: { slug: true } },
      },
    });

    if (!apiKeyRecord) {
      throw new UnauthorizedException('Invalid or revoked API key');
    }

    if (!apiKeyRecord.userId) {
      // An AGENT key without a linked user should not exist; treat as invalid.
      throw new UnauthorizedException('Invalid API key');
    }

    const agentUser = await this.prisma.user.findUnique({
      where: { id: apiKeyRecord.userId },
    });

    if (!agentUser || !agentUser.isActive || !agentUser.isAgent) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Attach in the same shape JwtStrategy produces (`req.user.user`) so the
    // existing `CurrentUser` decorator and services that take `User` work.
    request.user = { user: agentUser };
    request.mcpApiKey = {
      id: apiKeyRecord.id,
      projectId: apiKeyRecord.projectId,
      projectSlug: apiKeyRecord.project?.slug ?? null,
      environmentId: apiKeyRecord.environmentId,
      apiKeyPreview: apiKeyRecord.previewKey,
    };

    return true;
  }
}
