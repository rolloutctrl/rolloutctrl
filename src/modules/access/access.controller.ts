import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AccessService } from './access.service';

@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  /**
   * Evaluation API (debug / fallback)
   */
  @Post('evaluate')
  async evaluate(
    @Body()
    body: {
      roles: string[];
      attributes?: Record<string, any>;
      action: string;
      environment: string;
      userId?: string;
      kind?: string;
      key?: string;
    },
    @Headers('x-api-key') apiKey: string,
  ) {
    if (!apiKey) throw new UnauthorizedException('Missing API key');
    if (!body) throw new BadRequestException('Missing body');
    if (!Array.isArray(body.roles) || body.roles.length === 0) {
      throw new BadRequestException('roles must be a non-empty array');
    }
    if (!body.action || body.action.trim().length === 0) {
      throw new BadRequestException('Missing action');
    }
    if (!body.environment || body.environment.trim().length === 0) {
      throw new BadRequestException('Missing environment');
    }

    const projectId =
      await this.accessService.resolveProjectIdFromApiKey(apiKey);

    return this.accessService.can({ ...body, projectId });
  }

  /**
   * Feature flag evaluation
   *
   * Example request:
   * POST /access/evaluate/flag
   * {
   *   "flagKey": "dark-mode",
   *   "environment": "production",
   *   "userId": "user_123",
   *   "attributes": {
   *     "country": "US",
   *     "plan": "pro"
   *   }
   * }
   */
  @Post('evaluate/flag')
  async evaluateFlag(
    @Body()
    body: {
      flagKey: string;
      environment: string;
      userId?: string;
      kind?: string;
      key?: string;
      attributes?: Record<string, any>;
    },
    @Headers('x-api-key') apiKey: string,
  ) {
    if (!apiKey) throw new UnauthorizedException('Missing API key');
    if (!body) throw new BadRequestException('Missing body');
    if (!body.flagKey || body.flagKey.trim().length === 0) {
      throw new BadRequestException('Missing flagKey');
    }
    if (!body.environment || body.environment.trim().length === 0) {
      throw new BadRequestException('Missing environment');
    }

    const projectId =
      await this.accessService.resolveProjectIdFromApiKey(apiKey);

    return this.accessService.evaluateFlag({ ...body, projectId });
  }

  @Get('config')
  async getConfig(
    @Query('environment') environment: string,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (!apiKey) throw new UnauthorizedException('Missing API key');
    if (!environment || environment.trim().length === 0) {
      throw new BadRequestException('Missing environment');
    }

    const config = await this.accessService.getPublicConfig(
      apiKey,
      environment,
    );

    return config;
  }

  // @Post('cache/clear')
  // async clearCache() {
  //   await this.accessService.clearAllCache();
  //   return { ok: true };
  // }
}
