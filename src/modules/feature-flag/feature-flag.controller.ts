import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FeatureFlagService } from './feature-flag.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import {
  CreateFeatureFlagRequestDto,
  UpdateFeatureFlagRequestDto,
} from './dto';
import { ToggleFeatureFlagRequestDto } from './dto/toggle-flag.dto';
import { FeatureFlag, User } from 'src/common/generated/prisma/client';
import { ToggleFlagFavoriteRequestDto } from './dto/toggle-flag-favorite.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('feature-flags')
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_READ)
  getAll(
    @Param('projectId') projectId: string,
    @Query('includeArchived') includeArchived?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.featureFlagService.findAllFeatureFlags(
      projectId,
      includeArchived === 'true',
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':flagId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_READ)
  get(@Param('flagId') flagId: string, @Query('projectId') projectId: string) {
    return this.featureFlagService.findFeatureFlagById(flagId, projectId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_CREATE)
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateFeatureFlagRequestDto,
  ): Promise<FeatureFlag | FeatureFlag[]> {
    const isMultiple =
      dto.type === 'multiple' || (dto.flags && dto.flags.length > 0);

    if (isMultiple) {
      if (!dto.flags || dto.flags.length === 0) {
        throw new BadRequestException(
          'Flags array is required for multiple creation',
        );
      }
      return this.featureFlagService.createMultipleFeatureFlags(
        user,
        dto.projectId,
        dto.flags,
      );
    }

    if (!dto.key) {
      throw new BadRequestException('Key is required for single flag creation');
    }
    return this.featureFlagService.createFeatureFlag(user, dto.projectId, dto);
  }

  @Patch(':flagId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_UPDATE)
  update(
    @Param('flagId') flagId: string,
    @Body() dto: UpdateFeatureFlagRequestDto,
  ) {
    return this.featureFlagService.updateFeatureFlag(
      flagId,
      dto.projectId,
      dto,
    );
  }

  @Post('configure')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_UPDATE)
  configureEnvironment(
    @CurrentUser() user: User,
    @Body() dto: ToggleFeatureFlagRequestDto,
  ) {
    return this.featureFlagService.configureFlagForEnvironment(user, dto);
  }

  @Patch(':flagId/toggle-favorite')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_UPDATE)
  toggleFavorite(
    @Param('flagId') flagId: string,
    @Body() dto: ToggleFlagFavoriteRequestDto,
  ) {
    return this.featureFlagService.toggleFlagFavorite(flagId, dto.enabled);
  }

  @Delete(':flagId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_DELETE)
  delete(
    @CurrentUser() user: User,
    @Param('flagId') flagId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.featureFlagService.deleteFeatureFlag(user, flagId, projectId);
  }
}
