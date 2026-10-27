import { Injectable } from '@nestjs/common';
import { SegmentService } from '../../segment/segment.service';
import { McpPermissions } from '../mcp.permissions';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import type { McpToolDefinition } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';
import { projectIdSchema, segmentIdSchema } from './schemas';

/**
 * Mutation MCP tools for segments (Task 5).
 */
@Injectable()
export class SegmentMutationTools {
  constructor(
    private readonly segments: SegmentService,
    private readonly perms: McpPermissions,
  ) {}

  /** `create_segment` — create a segment with rules. */
  createSegment(): McpToolDefinition {
    return {
      name: 'create_segment',
      description:
        'Create a segment with rules in a project. `key` must match ^[a-z0-9.-]+$. Each rule has field, operator, value, and optional `not`.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          key: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            pattern: '^[a-z0-9.-]+$',
            description: 'Segment key',
          },
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            description: 'Segment name',
          },
          description: {
            type: 'string',
            maxLength: 500,
            description: 'Segment description',
          },
          rules: {
            type: 'array',
            description: 'Segment rules',
            items: {
              type: 'object',
              properties: {
                segmentId: {
                  type: 'string',
                  description:
                    'Segment ID (set to the new segment id; the service fills this)',
                },
                field: { type: 'string' },
                operator: {
                  type: 'string',
                  description: 'Comparison operator',
                },
                not: { type: 'boolean' },
                value: {},
              },
              required: ['field', 'operator', 'value'],
            },
          },
        },
        required: ['projectId', 'key', 'name', 'rules'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.SEGMENT_CREATE);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.segments.createSegment(ctx.user, args);
      },
    };
  }

  /** `update_segment` — update a segment (key, name, description, rules). */
  updateSegment(): McpToolDefinition {
    return {
      name: 'update_segment',
      description:
        'Update a segment. Replaces the segment key, name, description and rules. Each rule must include its `id` (for existing rules) and `segmentId`.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          segmentId: segmentIdSchema,
          key: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            pattern: '^[a-z0-9.-]+$',
            description: 'New segment key',
          },
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            description: 'New segment name',
          },
          description: {
            type: 'string',
            maxLength: 500,
            description: 'New segment description',
          },
          rules: {
            type: 'array',
            description: 'Updated segment rules',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Rule ID (for existing rules)',
                },
                segmentId: { type: 'string' },
                field: { type: 'string' },
                operator: { type: 'string' },
                not: { type: 'boolean' },
                value: {},
              },
              required: ['id', 'segmentId', 'field', 'operator', 'value'],
            },
          },
        },
        required: ['projectId', 'segmentId', 'key', 'name', 'rules'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.SEGMENT_UPDATE);
        this.perms.requireProjectScope(ctx, args.projectId);
        const { segmentId, projectId, ...dto } = args;
        return this.segments.updateSegment(ctx.user, projectId, segmentId, dto);
      },
    };
  }

  all(): McpToolDefinition[] {
    return [this.createSegment(), this.updateSegment()];
  }
}
