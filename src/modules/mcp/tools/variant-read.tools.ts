import { Injectable } from '@nestjs/common';
import { VariantService } from '../../variant/variant.service';
import { McpPermissions } from '../mcp.permissions';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import type { McpToolDefinition } from './tool.registry';
import type { McpRequestContext } from '../mcp.types';
import { projectIdSchema, flagIdSchema, variantIdSchema } from './schemas';

/**
 * Read-only MCP tools for variants.
 */
@Injectable()
export class VariantReadTools {
  constructor(
    private readonly variants: VariantService,
    private readonly perms: McpPermissions,
  ) {}

  /** `list_variants` — variants of a feature flag. */
  listVariants(): McpToolDefinition {
    return {
      name: 'list_variants',
      description:
        'List variants of a feature flag with their payload and color tag.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          flagId: flagIdSchema,
        },
        required: ['projectId', 'flagId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.VARIANT_READ);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.variants.findAllVariantsByFlagId(
          args.flagId,
          args.projectId,
        );
      },
    };
  }

  /** `get_variant` — details of a single variant. */
  getVariant(): McpToolDefinition {
    return {
      name: 'get_variant',
      description: 'Get details of a single variant by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: projectIdSchema,
          variantId: variantIdSchema,
        },
        required: ['projectId', 'variantId'],
      },
      annotations: { readOnlyHint: true, destructiveHint: false },
      handler: async (args: any, ctx: McpRequestContext) => {
        this.perms.requirePermission(ctx, PermissionCode.VARIANT_READ);
        this.perms.requireProjectScope(ctx, args.projectId);
        return this.variants.findVariantById(args.variantId, args.projectId);
      },
    };
  }

  all(): McpToolDefinition[] {
    return [this.listVariants(), this.getVariant()];
  }
}
