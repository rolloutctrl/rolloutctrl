import { Injectable } from '@nestjs/common';
import { VariantService } from '../../variant/variant.service';
import { McpPermissions } from '../mcp.permissions';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import type { McpToolDefinition } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';
import { projectIdSchema, flagIdSchema, variantIdSchema } from './schemas';

/**
 * Mutation MCP tools for variants (Task 5).
 */
@Injectable()
export class VariantMutationTools {
  constructor(
    private readonly variants: VariantService,
    private readonly perms: McpPermissions,
  ) {}

  /** `create_variant` — create a variant for a flag. */
  createVariant(): McpToolDefinition {
    return {
      name: 'create_variant',
      description:
        'Create a variant for a feature flag. `payload` and `payloadType` must be provided together (or both omitted). `colorTag` is required.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          featureFlagId: flagIdSchema,
          name: { type: 'string', description: 'Variant name' },
          colorTag: {
            type: 'string',
            description: 'Color tag for the variant',
          },
          description: { type: 'string', description: 'Variant description' },
          payloadType: {
            type: 'string',
            description: 'Payload type (e.g. STRING, NUMBER, JSON, BOOLEAN)',
          },
          payload: {
            type: 'string',
            description:
              'Variant payload (JSON string when payloadType is JSON)',
          },
        },
        required: ['projectId', 'featureFlagId', 'name', 'colorTag'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.VARIANT_CREATE);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.variants.createVariant(ctx.user, args);
      },
    };
  }

  /** `update_variant` — update a variant. */
  updateVariant(): McpToolDefinition {
    return {
      name: 'update_variant',
      description:
        'Update a variant. `payload` and `payloadType` must be provided together (or both omitted).',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          variantId: variantIdSchema,
          name: { type: 'string', description: 'New variant name' },
          colorTag: { type: 'string', description: 'New color tag' },
          description: {
            type: 'string',
            description: 'New variant description',
          },
          payloadType: {
            type: 'string',
            description: 'New payload type',
          },
          payload: {
            type: 'string',
            description:
              'New variant payload (JSON string when payloadType is JSON)',
          },
        },
        required: ['projectId', 'variantId'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.VARIANT_UPDATE);
        this.perms.requireProjectScope(ctx, args.projectId);
        const { variantId, ...dto } = args;
        return this.variants.updateVariant(ctx.user, variantId, dto);
      },
    };
  }

  all(): McpToolDefinition[] {
    return [this.createVariant(), this.updateVariant()];
  }
}
