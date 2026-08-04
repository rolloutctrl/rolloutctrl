import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SdkServerGuard } from './sdk-server.guard';
import { ApiKeyType } from 'src/common/generated/prisma/enums';

describe('SdkServerGuard', () => {
  let guard: SdkServerGuard;

  beforeEach(() => {
    guard = new SdkServerGuard();
  });

  function mockContext(sdkApiKey: any) {
    const request = { sdkApiKey };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  it('throws Forbidden when sdkApiKey not set', () => {
    expect(() => guard.canActivate(mockContext(undefined))).toThrow(
      ForbiddenException,
    );
  });

  it('throws Forbidden when API key type is CLIENT', () => {
    expect(() =>
      guard.canActivate(mockContext({ type: ApiKeyType.CLIENT })),
    ).toThrow(ForbiddenException);
  });

  it('returns true when API key type is SERVER', () => {
    const result = guard.canActivate(mockContext({ type: ApiKeyType.SERVER }));
    expect(result).toBe(true);
  });
});
