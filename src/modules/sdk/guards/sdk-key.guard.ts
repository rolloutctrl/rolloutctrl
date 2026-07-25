import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SdkKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey: string | undefined = request.headers['x-api-key'];

    if (!apiKey || apiKey.trim().length === 0) {
      throw new UnauthorizedException('Missing API key');
    }

    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const apiKeyRecord = await this.prisma.apiKey.findFirst({
      where: { keyHash, revokedAt: null },
      select: {
        id: true,
        projectId: true,
        type: true,
        environmentId: true,
        allowedOrigins: true,
      },
    });

    if (!apiKeyRecord) {
      throw new UnauthorizedException('Invalid or revoked API key');
    }

    request.sdkApiKey = apiKeyRecord;

    return true;
  }
}
