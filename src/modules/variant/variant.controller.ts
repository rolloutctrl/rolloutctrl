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

@Controller('variants')
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  @Get('flag/:flagId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.VARIANT_READ)
  async findVariantsByFlagId(
    @Param('flagId') flagId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.variantService.findAllVariantsByFlagId(flagId, projectId);
  }

  @Post('flag/:flagId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.VARIANT_CREATE)
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
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.VARIANT_UPDATE)
  async updateVariant(
    @CurrentUser() user: User,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantRequestDto,
  ) {
    return this.variantService.updateVariant(user, variantId, dto);
  }

  @Delete(':variantId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.VARIANT_DELETE)
  async deleteVariant(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('variantId') variantId: string,
  ) {
    await this.variantService.deleteVariant(user, variantId, projectId);
    return { message: 'Variant deleted successfully' };
  }

  @Get(':variantId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.VARIANT_READ)
  async findVariantById(
    @Param('variantId') variantId: string,
    @CurrentProjectId() projectId: string,
  ) {
    return this.variantService.findVariantById(variantId, projectId);
  }
}
