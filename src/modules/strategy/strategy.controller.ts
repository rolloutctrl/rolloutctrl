import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('strategies')
export class StrategyController {
  constructor(private strategyService: StrategyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_CREATE)
  async createStrategy(
    @CurrentUser() user: User,
    @Body() dto: CreateStrategyRequestDto,
  ) {
    return this.strategyService.createStrategy(user, dto);
  }

  @Get('environment/:featureFlagEnvironmentId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_READ)
  async getStrategiesByEnvironment(
    @Param('featureFlagEnvironmentId') featureFlagEnvironmentId: string,
  ) {
    return this.strategyService.findAllStrategies(featureFlagEnvironmentId);
  }

  @Get(':strategyId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_READ)
  async getStrategy(@Param('strategyId') strategyId: string) {
    return this.strategyService.findStrategyById(strategyId);
  }

  @Patch(':strategyId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
  async updateStrategy(
    @CurrentUser() user: User,
    @Param('strategyId') strategyId: string,
    @Body() dto: UpdateStrategyRequestDto,
  ) {
    return this.strategyService.updateStrategy(user, strategyId, dto);
  }

  @Post(':strategyId/toggle-enable')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_TOGGLE)
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
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_DELETE)
  async deleteStrategy(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('strategyId') strategyId: string,
  ) {
    await this.strategyService.deleteStrategy(user, strategyId, projectId);
    return { message: 'Strategy deleted successfully' };
  }

  @Patch('environment/:featureFlagEnvironmentId/reorder')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
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
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
  async createStrategyRule(@Body() dto: CreateStrategyRuleRequestDto) {
    return this.strategyService.createStrategyRule(dto);
  }

  @Get(':strategyId/rules')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_READ)
  async getStrategyRules(@Param('strategyId') strategyId: string) {
    return this.strategyService.findAllStrategyRules(strategyId);
  }

  @Patch('rules/:ruleId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
  async updateStrategyRule(
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateStrategyRuleRequestDto,
  ) {
    return this.strategyService.updateStrategyRule(ruleId, dto);
  }

  @Delete('rules/:ruleId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_DELETE)
  async deleteStrategyRule(@Param('ruleId') ruleId: string) {
    await this.strategyService.deleteStrategyRule(ruleId);
    return { message: 'Strategy rule deleted successfully' };
  }

  // ─── StrategyVariant management ───

  @Get(':strategyId/variants')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_READ)
  async getStrategyVariants(@Param('strategyId') strategyId: string) {
    return this.strategyService.findAllStrategyVariants(strategyId);
  }

  @Post(':strategyId/variants')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
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
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
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
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
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
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_STRATEGY_UPDATE)
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
