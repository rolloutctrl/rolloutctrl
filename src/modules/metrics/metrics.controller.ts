import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Metrics')
@ApiBearerAuth()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('flags/:flagId/metrics')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_METRICS_READ)
  @ApiOperation({ summary: 'Get metrics for a feature flag' })
  @ApiOkResponse({ description: 'Feature flag metrics' })
  @ApiBadRequestResponse({ description: 'Invalid date range' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_METRICS_READ)
  @ApiOperation({ summary: 'Get strategy metrics for a feature flag' })
  @ApiOkResponse({ description: 'Strategy metrics' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getStrategyMetrics(
    @Param('flagId') flagId: string,
    @Query('environmentId') environmentId?: string,
  ) {
    return this.metricsService.getStrategyMetrics(flagId, environmentId);
  }

  @Get('flags/:flagId/variants/metrics')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.FLAG_METRICS_READ)
  @ApiOperation({ summary: 'Get variant metrics for a feature flag' })
  @ApiOkResponse({ description: 'Variant metrics' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getVariantMetrics(
    @Param('flagId') flagId: string,
    @Query('environmentId') environmentId?: string,
  ) {
    return this.metricsService.getVariantMetrics(flagId, environmentId);
  }
}
