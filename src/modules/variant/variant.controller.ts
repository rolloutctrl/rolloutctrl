import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VariantService } from './variant.service';
import { CreateVariantRequestDto, UpdateVariantRequestDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { User } from 'src/common/generated/prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentProjectId } from 'src/common/decorators/current-project-id.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Variants')
@ApiBearerAuth()
@Controller('variants')
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  @Get('flag/:flagId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.VARIANT_READ)
  @ApiOperation({ summary: 'Get all variants for a feature flag' })
  @ApiOkResponse({ description: 'List of variants' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async findVariantsByFlagId(
    @Param('flagId') flagId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.variantService.findAllVariantsByFlagId(flagId, projectId);
  }

  @Post('flag/:flagId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.VARIANT_CREATE)
  @ApiOperation({ summary: 'Create a variant for a feature flag' })
  @ApiCreatedResponse({ description: 'Variant created successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async createVariant(
    @CurrentUser() user: User,
    @Param('flagId') flagId: string,
    @Body() dto: CreateVariantRequestDto,
  ) {
    return this.variantService.createVariant(user, {
      ...dto,
      featureFlagId: flagId,
      projectId: dto.projectId,
    });
  }

  @Patch(':variantId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.VARIANT_UPDATE)
  @ApiOperation({ summary: 'Update a variant' })
  @ApiOkResponse({ description: 'Variant updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async updateVariant(
    @CurrentUser() user: User,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantRequestDto,
  ) {
    return this.variantService.updateVariant(user, variantId, dto);
  }

  @Delete(':variantId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.VARIANT_DELETE)
  @ApiOperation({ summary: 'Delete a variant' })
  @ApiOkResponse({ description: 'Variant deleted successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async deleteVariant(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('variantId') variantId: string,
  ) {
    await this.variantService.deleteVariant(user, variantId, projectId);
    return { message: 'Variant deleted successfully' };
  }

  @Get(':variantId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.VARIANT_READ)
  @ApiOperation({ summary: 'Get a variant by id' })
  @ApiOkResponse({ description: 'Variant details' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async findVariantById(
    @Param('variantId') variantId: string,
    @CurrentProjectId() projectId: string,
  ) {
    return this.variantService.findVariantById(variantId, projectId);
  }
}
