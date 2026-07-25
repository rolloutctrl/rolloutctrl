import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentProjectId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-project-id'] as string | undefined;
  },
);
