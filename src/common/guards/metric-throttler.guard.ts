import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class MetricThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const projectId = req.body?.project_id;
    const sessionId = req.body?.payload?.session_id;

    if (!projectId || !sessionId) {
      return req.ip || 'unknown';
    }

    return `${projectId}:${sessionId}`;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: any,
  ): Promise<void> {
    const response = context.switchToHttp().getResponse();
    response.status(429).json({
      error: 'rate_limit_exceeded',
      retry_after: throttlerLimitDetail.ttl,
      message: 'Too many events from this session. Slow down.',
    });
  }
}
