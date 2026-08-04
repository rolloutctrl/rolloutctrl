import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Throttler guard for the admin API surface.
 *
 * Tracks rate limits per authenticated user (falling back to IP for
 * unauthenticated routes such as login), and returns a JSON 429 response
 * consistent with the rest of the API.
 *
 * Registered globally via APP_GUARD. SDK controllers opt out with
 * `@SkipThrottle()` since they have their own scale characteristics
 * (and `MetricThrottlerGuard` for evaluation events).
 */
@Injectable()
export class AdminThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userId = req.user?.user?.id ?? req.user?.sub;
    if (userId) {
      return `user:${userId}`;
    }
    return `ip:${req.ip ?? 'unknown'}`;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: any,
  ): Promise<void> {
    const response = context.switchToHttp().getResponse();
    response.status(429).json({
      error: 'rate_limit_exceeded',
      retry_after: throttlerLimitDetail.ttl,
      message: 'Too many requests. Please slow down and try again shortly.',
    });
  }
}
