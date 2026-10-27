import { Injectable } from '@nestjs/common';
import { ActionService } from '../../action/action.service';
import { McpPermissions } from '../mcp.permissions';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import type { McpToolDefinition } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';
import {
  projectIdSchema,
  actionIdSchema,
  cursorSchema,
  limitSchema,
} from './schemas';

/**
 * Read-only MCP tools for actions (access control rules).
 */
@Injectable()
export class ActionReadTools {
  constructor(
    private readonly actions: ActionService,
    private readonly perms: McpPermissions,
  ) {}

  /** `list_actions` — paginated list of actions in a project. */
  listActions(): McpToolDefinition {
    return {
      name: 'list_actions',
      description:
        'List actions (access control rules) of a project with their strategies and rules.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          cursor: cursorSchema,
          limit: limitSchema,
        },
        required: ['projectId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.ACTION_READ);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.actions.findAllActions(
          args.projectId,
          args.cursor,
          args.limit ?? 20,
        );
      },
    };
  }

  /** `get_action` — details of a single action. */
  getAction(): McpToolDefinition {
    return {
      name: 'get_action',
      description:
        'Get details of a single action by ID or key, including its strategies and rules.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          actionId: actionIdSchema,
        },
        required: ['projectId', 'actionId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.ACTION_READ);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.actions.findActionById(args.actionId, args.projectId);
      },
    };
  }

  all(): McpToolDefinition[] {
    return [this.listActions(), this.getAction()];
  }
}
