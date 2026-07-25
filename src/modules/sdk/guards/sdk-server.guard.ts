import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ApiKeyType } from 'src/common/generated/prisma/enums';

@Injectable()
export class SdkServerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const sdkKey = request.sdkApiKey;

    if (!sdkKey) {
      throw new ForbiddenException('API key not authenticated');
    }

    if (sdkKey.type !== ApiKeyType.SERVER) {
      throw new ForbiddenException(
        'A SERVER API key is required for this endpoint',
      );
    }

    return true;
  }
}
