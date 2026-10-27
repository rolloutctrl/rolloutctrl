import { Injectable } from '@nestjs/common';
import { EnvironmentService } from '../../environment/environment.service';
import { McpPermissions } from '../mcp.permissions';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import type { McpToolDefinition } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';
import { projectIdSchema, environmentIdSchema } from './schemas';

/**
 * Read-only MCP tools for environments.
 */
@Injectable()
export class EnvironmentReadTools {
  constructor(
    private readonly environments: EnvironmentService,
    private readonly perms: McpPermissions,
  ) {}

  /** `list_environments` — list environments of a project. */
  listEnvironments(): McpToolDefinition {
    return {
      name: 'list_environments',
      description: 'List environments of a project (name, isSystem, version).',
      inputSchema: {
        type: 'object',
        properties: { projectId: projectIdSchema },
        required: ['projectId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.ENV_READ);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.environments.findAll(args.projectId);
      },
    };
  }

  /** `get_environment` — details of a single environment. */
  getEnvironment(): McpToolDefinition {
    return {
      name: 'get_environment',
      description: 'Get details of a single environment by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          environmentId: environmentIdSchema,
        },
        required: ['projectId', 'environmentId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.ENV_READ);
        this.perms.requireProjectScope(ctx, args.projectId);
        if (ctx.scope.environmentId) {
          this.perms.requireEnvironmentScope(ctx, args.environmentId);
        }
        return this.environments.findOne(args.projectId, args.environmentId);
      },
    };
  }

  all(): McpToolDefinition[] {
    return [this.listEnvironments(), this.getEnvironment()];
  }
}
