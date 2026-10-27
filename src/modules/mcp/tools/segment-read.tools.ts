import { Injectable } from '@nestjs/common';
import { SegmentService } from '../../segment/segment.service';
import { McpPermissions } from '../mcp.permissions';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import type { McpToolDefinition } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';
import { projectIdSchema, segmentIdSchema } from './schemas';

/**
 * Read-only MCP tools for segments.
 */
@Injectable()
export class SegmentReadTools {
  constructor(
    private readonly segments: SegmentService,
    private readonly perms: McpPermissions,
  ) {}

  /** `list_segments` — segments of a project. */
  listSegments(): McpToolDefinition {
    return {
      name: 'list_segments',
      description: 'List segments of a project with their rules.',
      inputSchema: {
        type: 'object',
        properties: { projectId: projectIdSchema },
        required: ['projectId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.SEGMENT_READ);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.segments.findAllSegments(args.projectId);
      },
    };
  }

  /** `get_segment` — details of a single segment. */
  getSegment(): McpToolDefinition {
    return {
      name: 'get_segment',
      description:
        'Get details of a single segment by ID, including its rules.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          segmentId: segmentIdSchema,
        },
        required: ['projectId', 'segmentId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.SEGMENT_READ);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.segments.findSegmentById(args.segmentId, args.projectId);
      },
    };
  }

  all(): McpToolDefinition[] {
    return [this.listSegments(), this.getSegment()];
  }
}
