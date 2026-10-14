import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SdkKeyGuard } from '../guards/sdk-key.guard';
import { SdkService } from '../services/sdk.service';
import { SdkOriginGuard } from '../guards/sdk-origin.guard';
import { SdkEvaluationBatchDto } from '../dto/sdk-evaluate.dto';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('SDK Client')
@ApiSecurity('api-key')
@Controller('sdk/client')
@UseGuards(SdkKeyGuard, SdkOriginGuard)
@SkipThrottle()
export class SdkClientController {
  constructor(private readonly sdkService: SdkService) {}

  @Get('config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get SDK configuration for an environment' })
  @ApiOkResponse({ description: 'SDK configuration payload' })
  @ApiBadRequestResponse({ description: 'Missing environment query parameter' })
  @ApiUnauthorizedResponse({ description: 'Invalid API key' })
  async getConfig(@Req() req: any, @Query('environment') environment: string) {
    if (!environment || environment.trim().length === 0) {
      throw new BadRequestException('Missing environment query parameter');
    }

    return this.sdkService.getConfig(req.sdkApiKey, environment);
  }

  @Get('config/changes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get SDK configuration changes since a version' })
  @ApiOkResponse({ description: 'SDK configuration changes' })
  @ApiBadRequestResponse({ description: 'Invalid parameters' })
  @ApiUnauthorizedResponse({ description: 'Invalid API key' })
  async getConfigChanges(
    @Req() req: any,
    @Query('environment') environment: string,
    @Query('since') since: string,
  ) {
    if (!environment || environment.trim().length === 0) {
      throw new BadRequestException('Missing environment query parameter');
    }

    const sinceVersion = parseInt(since, 10);
    if (isNaN(sinceVersion)) {
      throw new BadRequestException('"since" must be a valid integer');
    }

    return this.sdkService.getConfigChanges(
      req.sdkApiKey,
      environment,
      sinceVersion,
    );
  }

  @Post('evaluations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track SDK evaluation events' })
  @ApiOkResponse({ description: 'Euations tracked successfully' })
  @ApiBadRequestResponse({
    description: 'evaluations must be a non-empty array',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid API key' })
  async trackEvaluations(@Req() req: any, @Body() body: SdkEvaluationBatchDto) {
    if (
      !body?.evaluations ||
      !Array.isArray(body.evaluations) ||
      body.evaluations.length === 0
    ) {
      throw new BadRequestException('evaluations must be a non-empty array');
    }

    await this.sdkService.trackEvaluations(
      req.sdkApiKey.projectId,
      body.evaluations,
    );

    return { ok: true };
  }
}
