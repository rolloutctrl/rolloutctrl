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
  UseGuards,
} from '@nestjs/common';
import { StrategyService } from './strategy.service';
import {
  CreateStrategyRequestDto,
  UpdateStrategyRequestDto,
  CreateStrategyRuleRequestDto,
  UpdateStrategyRuleRequestDto,
  ReorderRulesRequestDto,
  CreateStrategyVariantRequestDto,
  UpdateStrategyVariantRequestDto,
  BatchCreateStrategyVariantsRequestDto,
} from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { ToggleStrategyEnableRequestDto } from './dto/toggle-strategy.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/common/generated/prisma/client';
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

@ApiTags('Strategies')
@ApiBearerAuth()
@Controller('strategies')
export class StrategyController {
  constructor(private strategyService: StrategyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_CREATE)
  @ApiOperation({ summary: 'Create a new strategy' })
  @ApiCreatedResponse({ description: 'Strategy created successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async createStrategy(
    @CurrentUser() user: User,
    @Body() dto: CreateStrategyRequestDto,
  ) {
    return this.strategyService.createStrategy(user, dto);
  }

  @Get('environment/:featureFlagEnvironmentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_READ)
  @ApiOperation({
    summary: 'Get all strategies for a feature flag environment',
  })
  @ApiOkResponse({ description: 'List of strategies' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getStrategiesByEnvironment(
    @Param('featureFlagEnvironmentId') featureFlagEnvironmentId: string,
  ) {
    return this.strategyService.findAllStrategies(featureFlagEnvironmentId);
  }

  @Get(':strategyId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_READ)
  @ApiOperation({ summary: 'Get a strategy by id' })
  @ApiOkResponse({ description: 'Strategy details' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getStrategy(@Param('strategyId') strategyId: string) {
    return this.strategyService.findStrategyById(strategyId);
  }

  @Patch(':strategyId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
  @ApiOperation({ summary: 'Update a strategy' })
  @ApiOkResponse({ description: 'Strategy updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async updateStrategy(
    @CurrentUser() user: User,
    @Param('strategyId') strategyId: string,
    @Body() dto: UpdateStrategyRequestDto,
  ) {
    return this.strategyService.updateStrategy(user, strategyId, dto);
  }

  @Post(':strategyId/toggle-enable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_TOGGLE)
  @ApiOperation({ summary: 'Toggle strategy enable status' })
  @ApiOkResponse({ description: 'Strategy enable status toggled successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  toggleFavorite(
    @Param('strategyId') strategyId: string,
    @CurrentUser() user: User,
    @Body() dto: ToggleStrategyEnableRequestDto,
  ) {
    return this.strategyService.toggleStrategyEnable(
      strategyId,
      user,
      dto.enabled,
      dto.projectId,
    );
  }

  @Delete(':strategyId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_DELETE)
  @ApiOperation({ summary: 'Delete a strategy' })
  @ApiOkResponse({ description: 'Strategy deleted successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async deleteStrategy(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('strategyId') strategyId: string,
  ) {
    await this.strategyService.deleteStrategy(user, strategyId, projectId);
    return { message: 'Strategy deleted successfully' };
  }

  @Patch('environment/:featureFlagEnvironmentId/reorder')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
  @ApiOperation({
    summary: 'Reorder strategies for a feature flag environment',
  })
  @ApiOkResponse({ description: 'Strategies reordered successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async reorderStrategies(
    @Param('featureFlagEnvironmentId') featureFlagEnvironmentId: string,
    @Body() dto: ReorderRulesRequestDto,
  ) {
    return this.strategyService.reorderStrategies(
      featureFlagEnvironmentId,
      dto,
    );
  }

  @Post('rules')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
  @ApiOperation({ summary: 'Create a strategy rule' })
  @ApiCreatedResponse({ description: 'Strategy rule created successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async createStrategyRule(@Body() dto: CreateStrategyRuleRequestDto) {
    return this.strategyService.createStrategyRule(dto);
  }

  @Get(':strategyId/rules')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_READ)
  @ApiOperation({ summary: 'Get all rules for a strategy' })
  @ApiOkResponse({ description: 'List of strategy rules' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getStrategyRules(@Param('strategyId') strategyId: string) {
    return this.strategyService.findAllStrategyRules(strategyId);
  }

  @Patch('rules/:ruleId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
  @ApiOperation({ summary: 'Update a strategy rule' })
  @ApiOkResponse({ description: 'Strategy rule updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async updateStrategyRule(
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateStrategyRuleRequestDto,
  ) {
    return this.strategyService.updateStrategyRule(ruleId, dto);
  }

  @Delete('rules/:ruleId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_DELETE)
  @ApiOperation({ summary: 'Delete a strategy rule' })
  @ApiOkResponse({ description: 'Strategy rule deleted successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async deleteStrategyRule(@Param('ruleId') ruleId: string) {
    await this.strategyService.deleteStrategyRule(ruleId);
    return { message: 'Strategy rule deleted successfully' };
  }

  // ─── StrategyVariant management ───

  @Get(':strategyId/variants')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_READ)
  @ApiOperation({ summary: 'Get all variants for a strategy' })
  @ApiOkResponse({ description: 'List of strategy variants' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getStrategyVariants(@Param('strategyId') strategyId: string) {
    return this.strategyService.findAllStrategyVariants(strategyId);
  }

  @Post(':strategyId/variants')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
  @ApiOperation({ summary: 'Add a variant to a strategy' })
  @ApiCreatedResponse({ description: 'Variant added to strategy successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async addVariantToStrategy(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('strategyId') strategyId: string,
    @Body() dto: CreateStrategyVariantRequestDto,
  ) {
    return this.strategyService.addVariantToStrategy(
      user,
      strategyId,
      projectId,
      dto,
    );
  }

  @Post(':strategyId/variants/batch')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
  @ApiOperation({ summary: 'Batch add variants to a strategy' })
  @ApiCreatedResponse({
    description: 'Variants batch added to strategy successfully',
  })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async batchAddVariantsToStrategy(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('strategyId') strategyId: string,
    @Body() dto: BatchCreateStrategyVariantsRequestDto,
  ) {
    return this.strategyService.batchAddVariantsToStrategy(
      user,
      projectId,
      strategyId,
      dto,
    );
  }

  @Patch(':strategyId/variants/:variantId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
  @ApiOperation({ summary: 'Update a strategy variant' })
  @ApiOkResponse({ description: 'Strategy variant updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async updateStrategyVariant(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('strategyId') strategyId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateStrategyVariantRequestDto,
  ) {
    return this.strategyService.updateStrategyVariant(
      user,
      projectId,
      strategyId,
      variantId,
      dto,
    );
  }

  @Delete(':strategyId/variants/:variantId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
  @ApiOperation({ summary: 'Remove a variant from a strategy' })
  @ApiOkResponse({
    description: 'Variant removed from strategy successfully',
  })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async removeVariantFromStrategy(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('strategyId') strategyId: string,
    @Param('variantId') variantId: string,
  ) {
    await this.strategyService.removeVariantFromStrategy(
      user,
      projectId,
      strategyId,
      variantId,
    );
    return { message: 'Variant removed from strategy successfully' };
  }
}
