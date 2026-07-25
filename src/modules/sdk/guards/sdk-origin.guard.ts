import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ApiKeyType } from 'src/common/generated/prisma/enums';
import { Request } from 'express';

@Injectable()
export class SdkOriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const sdkKey = request.sdkApiKey;

    if (sdkKey.type !== ApiKeyType.CLIENT) {
      throw new ForbiddenException('Origin is required');
    }

    const origin = request.headers.origin;

    if (!origin || origin === 'null' || origin === '*') {
      throw new ForbiddenException('Origin is required');
    }

    const isAllowed = sdkKey.allowedOrigins.some((allowedOrigin) =>
      this.matchesOrigin(origin, allowedOrigin),
    );

    if (!isAllowed) {
      throw new ForbiddenException('Origin is not allowed');
    }

    return true;
  }

  private matchesOrigin(origin: string, allowedOrigin: string): boolean {
    if (!allowedOrigin.includes('*.')) {
      return origin === allowedOrigin;
    }

    const regex = new RegExp(
      '^' +
        allowedOrigin.replace(/\./g, '\\.').replace('*\\.', '[^.]+\\.') +
        '$',
      'i',
    );

    return regex.test(origin);
  }
}
