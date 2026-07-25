import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SdkKeyGuard } from '../guards/sdk-key.guard';
import { SdkServerGuard } from '../guards/sdk-server.guard';
import { SdkServerService } from '../services/sdk-server.service';
import { SdkEvaluationBatchDto } from '../dto/sdk-evaluate.dto';

@Controller('sdk/server')
@UseGuards(SdkKeyGuard, SdkServerGuard)
export class SdkServerController {
  constructor(private readonly sdkServerService: SdkServerService) {}

  @Get('config')
  async getConfig(@Req() req: any, @Query('environment') environment: string) {
    if (!environment || environment.trim().length === 0) {
      throw new BadRequestException('Missing environment query parameter');
    }

    return this.sdkServerService.getConfig(req.sdkApiKey, environment);
  }

  @Get('config/changes')
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

    return this.sdkServerService.getConfigChanges(
      req.sdkApiKey,
      environment,
      sinceVersion,
    );
  }

  @Post('evaluations')
  async trackEvaluations(@Req() req: any, @Body() body: SdkEvaluationBatchDto) {
    if (
      !body?.evaluations ||
      !Array.isArray(body.evaluations) ||
      body.evaluations.length === 0
    ) {
      throw new BadRequestException('evaluations must be a non-empty array');
    }

    await this.sdkServerService.trackEvaluations(
      req.sdkApiKey.projectId,
      body.evaluations,
    );

    return { ok: true };
  }
}
