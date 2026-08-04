import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SdkOriginGuard } from './sdk-origin.guard';
import { ApiKeyType } from 'src/common/generated/prisma/enums';

describe('SdkOriginGuard', () => {
  let guard: SdkOriginGuard;

  beforeEach(() => {
    guard = new SdkOriginGuard();
  });

  function mockContext(sdkApiKey: any, headers: Record<string, string> = {}) {
    const request = { headers, sdkApiKey };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  it('throws Forbidden when API key type is not CLIENT', () => {
    expect(() =>
      guard.canActivate(mockContext({ type: ApiKeyType.SERVER })),
    ).toThrow(ForbiddenException);
  });

  it('throws Forbidden when origin header missing', () => {
    expect(() =>
      guard.canActivate(
        mockContext({ type: ApiKeyType.CLIENT, allowedOrigins: [] }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('throws Forbidden when origin is "null"', () => {
    expect(() =>
      guard.canActivate(
        mockContext(
          { type: ApiKeyType.CLIENT, allowedOrigins: ['https://a.com'] },
          { origin: 'null' },
        ),
      ),
    ).toThrow(ForbiddenException);
  });

  it('throws Forbidden when origin is "*"', () => {
    expect(() =>
      guard.canActivate(
        mockContext(
          { type: ApiKeyType.CLIENT, allowedOrigins: ['https://a.com'] },
          { origin: '*' },
        ),
      ),
    ).toThrow(ForbiddenException);
  });

  it('throws Forbidden when origin not in allowedOrigins', () => {
    expect(() =>
      guard.canActivate(
        mockContext(
          { type: ApiKeyType.CLIENT, allowedOrigins: ['https://a.com'] },
          { origin: 'https://b.com' },
        ),
      ),
    ).toThrow(ForbiddenException);
  });

  it('returns true when origin exactly matches an allowed origin', () => {
    const result = guard.canActivate(
      mockContext(
        { type: ApiKeyType.CLIENT, allowedOrigins: ['https://a.com'] },
        { origin: 'https://a.com' },
      ),
    );
    expect(result).toBe(true);
  });

  it('matches wildcard subdomain origins', () => {
    const result = guard.canActivate(
      mockContext(
        {
          type: ApiKeyType.CLIENT,
          allowedOrigins: ['https://*.example.com'],
        },
        { origin: 'https://sub.example.com' },
      ),
    );
    expect(result).toBe(true);
  });

  it('does not match multi-level subdomain against single-level wildcard', () => {
    expect(() =>
      guard.canActivate(
        mockContext(
          {
            type: ApiKeyType.CLIENT,
            allowedOrigins: ['https://*.example.com'],
          },
          { origin: 'https://a.b.example.com' },
        ),
      ),
    ).toThrow(ForbiddenException);
  });

  it('is case-insensitive for wildcard origin matching', () => {
    const result = guard.canActivate(
      mockContext(
        {
          type: ApiKeyType.CLIENT,
          allowedOrigins: ['https://*.example.com'],
        },
        { origin: 'https://SUB.EXAMPLE.COM' },
      ),
    );
    expect(result).toBe(true);
  });
});
