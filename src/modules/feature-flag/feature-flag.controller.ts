import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Feature Flags')
@ApiBearerAuth()
@Controller('feature-flags')
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  @Get('project/:projectId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_READ)
  @ApiOperation({ summary: 'Get all feature flags for a project' })
  @ApiOkResponse({ description: 'Paginated list of feature flags' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_READ)
  @ApiOperation({ summary: 'Get a feature flag by id' })
  @ApiOkResponse({ description: 'Feature flag details' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  get(@Param('flagId') flagId: string, @Query('projectId') projectId: string) {
    return this.featureFlagService.findFeatureFlagById(flagId, projectId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_CREATE)
  @ApiOperation({ summary: 'Create one or multiple feature flags' })
  @ApiCreatedResponse({ description: 'Feature flag(s) created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_UPDATE)
  @ApiOperation({ summary: 'Update a feature flag' })
  @ApiOkResponse({ description: 'Feature flag updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_UPDATE)
  @ApiOperation({ summary: 'Configure a feature flag for an environment' })
  @ApiOkResponse({
    description: 'Flag configured for environment successfully',
  })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  configureEnvironment(
    @CurrentUser() user: User,
    @Body() dto: ToggleFeatureFlagRequestDto,
  ) {
    return this.featureFlagService.configureFlagForEnvironment(user, dto);
  }

  @Patch(':flagId/toggle-favorite')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_UPDATE)
  @ApiOperation({ summary: 'Toggle feature flag favorite status' })
  @ApiOkResponse({ description: 'Favorite status toggled successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  toggleFavorite(
    @Param('flagId') flagId: string,
    @Body() dto: ToggleFlagFavoriteRequestDto,
  ) {
    return this.featureFlagService.toggleFlagFavorite(flagId, dto.enabled);
  }

  @Delete(':flagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_DELETE)
  @ApiOperation({ summary: 'Delete a feature flag' })
  @ApiNoContentResponse({ description: 'Feature flag deleted successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  delete(
    @CurrentUser() user: User,
    @Param('flagId') flagId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.featureFlagService.deleteFeatureFlag(user, flagId, projectId);
  }
}
