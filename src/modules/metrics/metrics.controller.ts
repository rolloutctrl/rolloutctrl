import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('flags/:flagId/metrics')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_METRICS_READ)
  getFlagMetrics(
    @Param('flagId') flagId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('projectId') projectId?: string,
    @Query('environmentId') environmentId?: string,
  ) {
    const fromDate = from
      ? new Date(from)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    if (isNaN(fromDate.getTime())) {
      throw new BadRequestException('Invalid from date');
    }
    if (isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid to date');
    }

    return this.metricsService.getFlagMetrics(
      flagId,
      fromDate,
      toDate,
      environmentId,
    );
  }

  @Get('flags/:flagId/strategies/metrics')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_METRICS_READ)
  getStrategyMetrics(
    @Param('flagId') flagId: string,
    @Query('environmentId') environmentId?: string,
  ) {
    return this.metricsService.getStrategyMetrics(flagId, environmentId);
  }

  @Get('flags/:flagId/variants/metrics')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_METRICS_READ)
  getVariantMetrics(
    @Param('flagId') flagId: string,
    @Query('environmentId') environmentId?: string,
  ) {
    return this.metricsService.getVariantMetrics(flagId, environmentId);
  }
}
