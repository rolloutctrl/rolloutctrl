import { Injectable } from '@nestjs/common';
import { ActionService } from '../../action/action.service';
import { McpPermissions } from '../mcp.permissions';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import type { McpToolDefinition } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';
import { projectIdSchema, actionIdSchema } from './schemas';

/**
 * Mutation MCP tools for actions (Task 5).
 *
 * Actions are access control rules (effect + strategies + rules). There is no
 * `execute_flag_action` in RolloutCtrl — actions are evaluated by the access
 * layer, not executed on demand. So only create/update are exposed.
 */
@Injectable()
export class ActionMutationTools {
  constructor(
    private readonly actions: ActionService,
    private readonly perms: McpPermissions,
  ) {}

  /** `create_action` — create an action with optional strategies. */
  createAction(): McpToolDefinition {
    return {
      name: 'create_action',
      description:
        'Create an action (access control rule) in a project. Each strategy has an effect, optional segmentIds, matchType and rules. Each strategy must have at least one rule.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          key: { type: 'string', description: 'Action key' },
          description: { type: 'string', description: 'Action description' },
          enabled: {
            type: 'boolean',
            description: 'Whether the action is enabled',
          },
          defaultEffect: {
            type: 'string',
            description: 'Default effect (e.g. ALLOW, DENY)',
          },
          strategies: {
            type: 'array',
            description: 'Strategies for this action',
            items: {
              type: 'object',
              properties: {
                effect: {
                  type: 'string',
                  description: 'Effect when strategy matches',
                },
                priority: { type: 'number', minimum: 0 },
                enabled: { type: 'boolean' },
                segmentIds: { type: 'array', items: { type: 'string' } },
                matchType: {
                  type: 'string',
                  description: 'How rules are matched',
                },
                rules: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      operator: { type: 'string' },
                      value: { type: 'string' },
                      not: { type: 'boolean' },
                    },
                    required: ['field', 'operator', 'value'],
                  },
                },
              },
              required: ['effect'],
            },
          },
        },
        required: ['projectId', 'key'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.ACTION_CREATE);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.actions.createAction(ctx.user, args);
      },
    };
  }

  /** `update_action` — update an action. */
  updateAction(): McpToolDefinition {
    return {
      name: 'update_action',
      description:
        'Update an action key, description, enabled state, default effect, and/or strategies. Each strategy may include an `id` to update an existing strategy.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          actionId: actionIdSchema,
          key: { type: 'string', description: 'New action key' },
          description: {
            type: 'string',
            description: 'New action description',
          },
          enabled: {
            type: 'boolean',
            description: 'Whether the action is enabled',
          },
          defaultEffect: { type: 'string', description: 'New default effect' },
          strategies: {
            type: 'array',
            description: 'Updated strategies',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Strategy ID (when updating existing)',
                },
                effect: { type: 'string' },
                priority: { type: 'number', minimum: 0 },
                enabled: { type: 'boolean' },
                segmentIds: { type: 'array', items: { type: 'string' } },
                matchType: { type: 'string' },
                rules: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        description: 'Rule ID (when updating existing)',
                      },
                      field: { type: 'string' },
                      operator: { type: 'string' },
                      value: { type: 'string' },
                      not: { type: 'boolean' },
                    },
                    required: ['field', 'operator', 'value'],
                  },
                },
              },
              required: ['effect'],
            },
          },
        },
        required: ['projectId', 'actionId'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.ACTION_UPDATE);
        this.perms.requireProjectScope(ctx, args.projectId);
        const { actionId, projectId, ...dto } = args;
        return this.actions.updateAction(ctx.user, projectId, actionId, dto);
      },
    };
  }

  all(): McpToolDefinition[] {
    return [this.createAction(), this.updateAction()];
  }
}
